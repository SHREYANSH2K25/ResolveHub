import express from "express";
import auth from "../middlewares/auth.js"
import authorize from "../middlewares/rbac.js";
import { User } from "../models/User.js";
import {hashPassword} from "../services/authService.js"
import { VerificationCode } from "../models/Verificationmodel.js";
import { Complaint } from "../models/Complaint.js";
import { getLeaderboard, getGamificationStats } from "../services/gamificationService.js";

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
    console.log('TEST: Admin route is working');
    res.json({ message: 'Admin route is working' });
});

router.post('/users', auth, authorize('admin'), async (req, res) => {
  console.log('=== ADMIN CREATE STAFF REQUEST RECEIVED ===');
  
  try {
    console.log('Raw request body:', req.body);
    console.log('User from token:', req.user);
    
    const { name, email, password, department } = req.body;

    // Basic validation
    if (!name || !email || !password || !department) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        msg: 'All fields are required',
        received: { name: !!name, email: !!email, password: !!password, department: !!department }
      });
    }

    // Validate department
    const validDepartments = ['Sanitation', 'Structural', 'Plumbing', 'Electrical'];
    if (!validDepartments.includes(department)) {
      console.log('❌ Invalid department:', department);
      return res.status(400).json({ 
        msg: 'Invalid department. Must be one of: ' + validDepartments.join(', '),
        received: department
      });
    }

    // Find admin
    console.log('Finding admin with ID:', req.user.id);
    const admin = await User.findById(req.user.id);
    console.log('Admin found:', admin ? { id: admin._id, name: admin.name, city: admin.city } : null);
    
    if (!admin) {
      console.log('❌ Admin not found');
      return res.status(403).json({ msg: 'Admin not found' });
    }
    
    if (!admin.city) {
      console.log('❌ Admin city not assigned');
      return res.status(400).json({ msg: 'Admin city not assigned' });
    }

    // Check if user already exists
    console.log('Checking if user exists with email:', email);
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new staff user
    console.log('Creating new staff user...');
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: '', // Will be hashed below
      city: admin.city,
      role: 'staff', // Explicitly set role for Mongoose conditional validation
      department: department.trim()
    });

    // Hash password
    console.log('Hashing password...');
    let hashedPassword = '';
    try {
        hashedPassword = await hashPassword(password);
        newUser.password = hashedPassword;
        console.log('Password successfully hashed and assigned.');
    } catch (hashError) {
        console.error('❌ ERROR DURING PASSWORD HASHING:', hashError.message);
        throw hashError; 
    }
    
    // Save user
    console.log('Saving user to database...');
    await newUser.save();
    
    console.log('✅ Staff user created successfully:', newUser._id);

    return res.status(201).json({
      msg: `Staff user created for ${admin.city} successfully`,
      userId: newUser._id,
      role: newUser.role,
      city: newUser.city,
      department: newUser.department,
    });

  } catch (err) {
    console.error('❌ ADMIN USER CREATION ERROR:', err);
    console.error('❌ Error stack:', err.stack);
    
    // Handle specific errors
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Email already exists', error: 'DUPLICATE_EMAIL' });
    }
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      // Mongoose Validation Error (Status 400 is appropriate here)
      return res.status(400).json({ msg: 'Validation error', errors: messages });
    }
    
    // Catch-all 500 error 
    return res.status(500).json({ 
      msg: 'Server error while creating staff user', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

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

// Get leaderboard for admin's city
router.get('/leaderboard', auth, authorize('admin'), async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin) {
            return res.status(403).json({ msg: "Admin not found" });
        }
        if (!admin.city) {
            return res.status(400).json({ msg: "Admin city not assigned" });
        }

        const limit = parseInt(req.query.limit) || 10;
        const leaderboard = await getLeaderboard(admin.city, limit);

        res.json({
            success: true,
            data: leaderboard,
            city: admin.city
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ msg: 'Server error while fetching leaderboard' });
    }
});

// Get gamification stats for admin dashboard
router.get('/gamification-stats', auth, authorize('admin'), async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin) {
            return res.status(403).json({ msg: "Admin not found" });
        }
        if (!admin.city) {
            return res.status(400).json({ msg: "Admin city not assigned" });
        }

        const stats = await getGamificationStats(admin.city);

        res.json({
            success: true,
            data: stats,
            city: admin.city
        });
    } catch (error) {
        console.error('Error fetching gamification stats:', error);
        res.status(500).json({ msg: 'Server error while fetching gamification stats' });
    }
});

export default router;