import express from "express";
import auth from "../middlewares/auth.js"
import authorize from "../middlewares/rbac.js";
import { User } from "../models/User.js";
import {hashPassword} from "../services/authService.js"
import { VerificationCode } from "../models/Verificationmodel.js";
import { Complaint } from "../models/Complaint.js";

const router = express.Router();

router.post('/users', auth, authorize('admin'), async(req, res) => {
    const { name, email, password, city, department} = req.body;
    
    try{
        const admin = await User.findById(req.user.id);
        if(!admin) return res.status(403).json({msg: "Admin not found"});
        if (!admin.city) {
            return res.status(400).json({ msg: "Admin city not assigned" });
        }
        if (!department || department.trim() === '') {
            return res.status(400).json({ msg: 'Department is required for creating staff member.' });
        }

        // Validate department enum
        const validDepartments = ['Sanitation', 'Structural', 'Plumbing', 'Electrical'];
        if (!validDepartments.includes(department.trim())) {
            return res.status(400).json({ msg: 'Invalid department. Must be one of: ' + validDepartments.join(', ') });
        }

        let user = await User.findOne({email});
        if(user) return res.status(400).json({msg : 'User already exists'});

        user = new User({
            name, 
            email, 
            password, 
            city : admin.city,
            role: 'staff',
            department: department.trim()
        });

        user.password = await hashPassword(password);
        await user.save();

        res.json({
            msg : `Staff user created for ${admin.city} successfully and provisioned`,
            userId : user.id,
            role : user.role,
            city : user.city,
            department : user.department
        });
    }
    catch(err){
        console.error('Admin user creation error: ', err.message);
        res.status(500).send('Server error');
    }
})


router.post('/verification-code', auth, authorize('admin'), async(req, res)=> {
    try{
        const admin = await User.findById(req.user.id);
        if (!admin) return res.status(403).json({ msg: "Admin not found" });
        if (!admin.city) return res.status(400).json({ msg: "Admin city not assigned" });
        // invalidate old code and generate a new one
        await VerificationCode.updateMany(
            { used : false, city : admin.city},
            { $set : {
                used : true
            }}
        );
        
        // Generation a code
        const newCode = Math.random().toString(36).substring(2,8).toUpperCase();
        const code = new VerificationCode({
            code : newCode,
            city : admin.city,
            used : false,
            expiresAt: new Date(Date.now() + 24*60*60*1000)
        })
        await code.save();

        res.json({
            msg: `Verification code generated for ${admin.city}`,
            code: newCode
        });

    }
    catch(err) {
        console.error("Verification Code generation error : ", err.message);
        res.status(500).send('Server error');
    }
})

// Statistics endpoint
router.get('/statistics', auth, authorize('admin'), async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin) return res.status(403).json({ msg: "Admin not found" });

        const { timeRange = '30days', startDate, endDate } = req.query;
        
        // Calculate date ranges
        let dateFilter = {};
        const now = new Date();
        
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else {
            let daysAgo;
            switch (timeRange) {
                case '7days':
                    daysAgo = 7;
                    break;
                case '30days':
                    daysAgo = 30;
                    break;
                case '90days':
                    daysAgo = 90;
                    break;
                case '1year':
                    daysAgo = 365;
                    break;
                default:
                    daysAgo = 30;
            }
            dateFilter.createdAt = {
                $gte: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
            };
        }

        // Filter by city for non-global admins
        let cityFilter = {};
        if (admin.city && admin.city !== 'Global') {
            // For city-specific complaints, filter by city field or assigned staff from that city
            const cityStaff = await User.find({ role: 'staff', city: admin.city }).select('_id');
            const staffIds = cityStaff.map(staff => staff._id);
            
            cityFilter = {
                $or: [
                    { city: admin.city },
                    { assignedTo: { $in: staffIds } }
                ]
            };
        }

        const combinedFilter = { ...dateFilter, ...cityFilter };

        // Get overview statistics
        const totalComplaints = await Complaint.countDocuments(combinedFilter);
        const resolvedComplaints = await Complaint.countDocuments({
            ...combinedFilter,
            status: { $in: ['RESOLVED', 'AUTO-CLOSED'] }
        });
        const pendingComplaints = await Complaint.countDocuments({
            ...combinedFilter,
            status: 'OPEN'
        });
        const inProgressComplaints = await Complaint.countDocuments({
            ...combinedFilter,
            status: 'IN_PROGRESS'
        });

        // Calculate average resolution time
        const resolvedComplaintsWithTime = await Complaint.find({
            ...combinedFilter,
            status: { $in: ['RESOLVED', 'AUTO-CLOSED'] },
            resolvedAt: { $exists: true }
        }).select('createdAt resolvedAt');

        let avgResolutionTime = 0;
        if (resolvedComplaintsWithTime.length > 0) {
            const totalResolutionTime = resolvedComplaintsWithTime.reduce((sum, complaint) => {
                const resolutionTime = (complaint.resolvedAt - complaint.createdAt) / (1000 * 60 * 60 * 24); // days
                return sum + resolutionTime;
            }, 0);
            avgResolutionTime = totalResolutionTime / resolvedComplaintsWithTime.length;
        }

        // Get category breakdown
        const categoryStats = await Complaint.aggregate([
            { $match: combinedFilter },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get status breakdown
        const statusStats = await Complaint.aggregate([
            { $match: combinedFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get daily trend data
        const trendData = await Complaint.aggregate([
            { $match: combinedFilter },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    complaints: { $sum: 1 },
                    resolved: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['RESOLVED', 'AUTO-CLOSED']] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Get staff performance (for city admins)
        let staffPerformance = [];
        if (admin.city && admin.city !== 'Global') {
            const cityStaff = await User.find({ role: 'staff', city: admin.city });
            
            for (const staff of cityStaff) {
                const assignedCount = await Complaint.countDocuments({
                    ...combinedFilter,
                    assignedToId: staff._id
                });
                const resolvedCount = await Complaint.countDocuments({
                    ...combinedFilter,
                    assignedToId: staff._id,
                    status: { $in: ['RESOLVED', 'AUTO-CLOSED'] }
                });

                staffPerformance.push({
                    name: staff.name,
                    department: staff.department,
                    assigned: assignedCount,
                    resolved: resolvedCount,
                    percentage: assignedCount > 0 ? Math.round((resolvedCount / assignedCount) * 100) : 0
                });
            }
        }

        // Active staff count
        const activeStaff = await User.countDocuments({
            role: 'staff',
            ...(admin.city && admin.city !== 'Global' ? { city: admin.city } : {})
        });

        res.json({
            overview: {
                totalComplaints,
                resolvedComplaints,
                pendingComplaints,
                inProgressComplaints,
                avgResolutionTime: avgResolutionTime.toFixed(1),
                resolutionRate: totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0,
                activeStaff
            },
            categories: categoryStats,
            statusBreakdown: statusStats,
            trends: trendData,
            staffPerformance: admin.city !== 'Global' ? staffPerformance : [],
            timeRange,
            city: admin.city
        });

    } catch (err) {
        console.error('Statistics error:', err.message);
        res.status(500).send('Server error');
    }
});

// Export statistics as CSV
router.get('/statistics/export', auth, authorize('admin'), async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin) return res.status(403).json({ msg: "Admin not found" });

        const { format = 'csv', timeRange = '30days', startDate, endDate } = req.query;
        
        // Calculate date filter (same logic as above)
        let dateFilter = {};
        const now = new Date();
        
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else {
            let daysAgo = timeRange === '7days' ? 7 : timeRange === '90days' ? 90 : timeRange === '1year' ? 365 : 30;
            dateFilter.createdAt = {
                $gte: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
            };
        }

        // City filter
        let cityFilter = {};
        if (admin.city && admin.city !== 'Global') {
            const cityStaff = await User.find({ role: 'staff', city: admin.city }).select('_id');
            const staffIds = cityStaff.map(staff => staff._id);
            
            cityFilter = {
                $or: [
                    { city: admin.city },
                    { assignedTo: { $in: staffIds } }
                ]
            };
        }

        const combinedFilter = { ...dateFilter, ...cityFilter };

        // Get detailed complaint data
        const complaints = await Complaint.find(combinedFilter)
            .populate('submittedBy', 'name email')
            .populate('assignedTo', 'name department')
            .select('title category status createdAt resolvedAt city submittedBy assignedTo')
            .lean();

        if (format === 'csv') {
            // Generate CSV
            const csvHeader = 'Title,Category,Status,Priority,Submitted By,Assigned To,Department,Created Date,Resolved Date,Days to Resolve\n';
            
            const csvRows = complaints.map(complaint => {
                const daysToResolve = complaint.resolvedAt ? 
                    Math.round((complaint.resolvedAt - complaint.createdAt) / (1000 * 60 * 60 * 24)) : 
                    '';
                
                return [
                    `"${complaint.title}"`,
                    complaint.category || '',
                    complaint.status,
                    complaint.priority || '',
                    complaint.submittedBy?.name || '',
                    complaint.assignedToId?.name || '',
                    complaint.assignedToId?.department || '',
                    complaint.createdAt.toISOString().split('T')[0],
                    complaint.resolvedAt ? complaint.resolvedAt.toISOString().split('T')[0] : '',
                    daysToResolve
                ].join(',');
            }).join('\n');

            const csvContent = csvHeader + csvRows;
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=complaints_${admin.city || 'all'}_${timeRange}.csv`);
            res.send(csvContent);
        } else {
            res.status(400).json({ msg: 'Unsupported export format' });
        }

    } catch (err) {
        console.error('Export error:', err.message);
        res.status(500).send('Server error');
    }
});

export default router;