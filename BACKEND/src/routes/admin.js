import express from "express";
import auth from "../middlewares/auth.js"
import authorize from "../middlewares/rbac.js";
import { User } from "../models/User.js";
import {hashPassword} from "../services/authService.js"
import { VerificationCode } from "../models/Verificationmodel.js";
import { Complaint } from "../models/Complaint.js";
import { getLeaderboard, getGamificationStats, calculateUserBadge } from "../services/gamificationService.js";

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
    console.log('TEST: Admin route is working');
    res.json({ message: 'Admin route is working' });
});

// Test gamification update (for testing purposes)
router.post('/test-gamification/:staffId', auth, authorize('admin'), async (req, res) => {
    try {
        const { staffId } = req.params;
        const staff = await User.findById(staffId);
        
        if (!staff || staff.role !== 'staff') {
            return res.status(404).json({ msg: 'Staff member not found' });
        }

        // Simulate a resolved complaint for testing
        const mockComplaint = {
            _id: 'test-complaint',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            resolutionDate: new Date(),
            assignedTo: staffId
        };

        // Import gamification function
        const { updateLeaderboardPoints } = await import('../services/gamificationService.js');
        const result = await updateLeaderboardPoints(staffId, mockComplaint, 'RESOLUTION');

        // Get updated staff info
        const updatedStaff = await User.findById(staffId)
            .select('name fullname points resolutionStreak topFixerBadge');

        res.json({
            success: true,
            message: 'Gamification test completed',
            pointsAwarded: result.totalPointsAwarded,
            updatedStaff: {
                name: updatedStaff.fullname || updatedStaff.name,
                points: updatedStaff.points,
                streak: updatedStaff.resolutionStreak,
                badge: updatedStaff.topFixerBadge
            }
        });
    } catch (error) {
        console.error('Error in gamification test:', error);
        res.status(500).json({ msg: 'Error testing gamification' });
    }
});

// Create test data endpoint (for development only)
router.post('/create-test-data', auth, authorize('admin'), async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || !admin.city) {
            return res.status(400).json({ msg: "Admin city not assigned" });
        }

        // Find existing staff in admin's city or create sample points
        const staffMembers = await User.find({ role: 'staff', city: admin.city });
        
        if (staffMembers.length === 0) {
            return res.status(404).json({ msg: 'No staff members found in your city' });
        }

        // Add some sample points to staff members
        const updates = [];
        for (let i = 0; i < Math.min(staffMembers.length, 5); i++) {
            const staff = staffMembers[i];
            const samplePoints = Math.floor(Math.random() * 500) + 50; // 50-550 points
            const sampleStreak = Math.floor(Math.random() * 10) + 1; // 1-10 streak
            
            await User.findByIdAndUpdate(staff._id, {
                $set: {
                    points: samplePoints,
                    resolutionStreak: sampleStreak,
                    topFixerBadge: calculateUserBadge(samplePoints).name
                }
            });
            
            updates.push({
                name: staff.fullname || staff.name,
                points: samplePoints,
                streak: sampleStreak,
                badge: calculateUserBadge(samplePoints).name
            });
        }

        res.json({
            success: true,
            message: 'Test data created successfully',
            updatedStaff: updates
        });
    } catch (error) {
        console.error('Error creating test data:', error);
        res.status(500).json({ msg: 'Error creating test data' });
    }
});

router.post('/users', auth, authorize('admin'), async (req, res) => {
  console.log('=== ADMIN CREATE STAFF REQUEST RECEIVED ===');
  
  try {
    console.log('Raw request body:', req.body);
    console.log('User from token:', req.user);
    
    const { name, email, password, department } = req.body;

    // Basic validation with detailed error messages
    if (!name || !email || !password || !department) {
      console.log('❌ Missing required fields');
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!email) missingFields.push('email'); 
      if (!password) missingFields.push('password');
      if (!department) missingFields.push('department');
      
      return res.status(400).json({ 
        msg: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields,
        received: { 
          name: name || 'missing', 
          email: email || 'missing', 
          password: password ? 'provided' : 'missing', 
          department: department || 'missing' 
        }
      });
    }

    // Validate data types and formats
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ msg: 'Name must be a non-empty string' });
    }
    
    if (typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }
    
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
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

    // Find admin and verify permissions
    console.log('Finding admin with ID:', req.user.id);
    const admin = await User.findById(req.user.id).select('_id name email city role');
    console.log('Admin found:', admin ? { 
      id: admin._id, 
      name: admin.name, 
      city: admin.city, 
      role: admin.role 
    } : null);
    
    if (!admin) {
      console.log('❌ Admin not found in database');
      return res.status(403).json({ 
        msg: 'Admin user not found. Please login again.',
        userId: req.user.id
      });
    }
    
    if (admin.role !== 'admin') {
      console.log('❌ User is not admin:', admin.role);
      return res.status(403).json({ 
        msg: 'Access denied. Admin role required.',
        userRole: admin.role
      });
    }
    
    if (!admin.city || admin.city.trim() === '') {
      console.log('❌ Admin city not assigned');
      return res.status(400).json({ 
        msg: 'Admin city not assigned. Contact system administrator.',
        adminCity: admin.city
      });
    }    // Check if user already exists
    console.log('Checking if user exists with email:', email);
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new staff user (restricted to admin's city)
    console.log(`Creating new staff user for city: ${admin.city}`);
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: '', // Will be hashed below
      city: admin.city, // Enforce admin's city - no choice for admin
      role: 'staff', // Explicitly set role for Mongoose conditional validation
      department: department.trim(),
      // Initialize gamification fields
      points: 0,
      resolutionStreak: 0,
      topFixerBadge: 'None'
    });    // Hash password
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

// Get individual user gamification stats (for staff dashboard)
router.get('/user-gamification-stats/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = await User.findById(req.user.id);
        
        // Allow admin to view any user's stats, or users to view their own
        if (currentUser.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({ msg: "Access denied. You can only view your own stats." });
        }

        const user = await User.findById(userId)
            .select('name fullname email department city points resolutionStreak topFixerBadge role');
        
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (user.role !== 'staff') {
            return res.status(400).json({ msg: "Gamification stats are only available for staff members" });
        }

        // Get user's complaint resolution stats
        const complaintsResolved = await Complaint.countDocuments({
            assignedTo: userId,
            status: 'RESOLVED'
        });

        const totalComplaints = await Complaint.countDocuments({
            assignedTo: userId
        });

        // Calculate recent performance (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentComplaints = await Complaint.countDocuments({
            assignedTo: userId,
            status: 'RESOLVED',
            resolvedAt: { $gte: thirtyDaysAgo }
        });

        const currentBadge = calculateUserBadge(user.points);

        // Get user's rank in their city
        const higherRankedStaff = await User.countDocuments({
            role: 'staff',
            city: user.city,
            points: { $gt: user.points }
        });
        const userRank = higherRankedStaff + 1;

        const userStats = {
            _id: user._id,
            name: user.fullname || user.name,
            email: user.email,
            department: user.department,
            city: user.city,
            totalPoints: user.points,
            currentStreak: user.resolutionStreak,
            complaintsResolved,
            totalComplaints,
            monthlyPoints: recentComplaints * 10, // Approximate calculation
            weeklyPoints: Math.floor(recentComplaints / 4) * 10,
            rank: userRank,
            topFixerBadge: user.topFixerBadge || currentBadge.name,
            badges: user.topFixerBadge ? [{
                name: user.topFixerBadge,
                icon: currentBadge.icon,
                color: currentBadge.color,
                earned: '2 weeks ago' // This could be tracked more precisely
            }] : [],
            achievements: [
                {
                    name: 'First Resolution',
                    date: '2024-01-15',
                    points: 50
                },
                {
                    name: '10 Day Streak',
                    date: '2024-01-20',
                    points: 100
                }
            ] // This could be enhanced with actual achievement tracking
        };

        res.json({
            success: true,
            data: userStats
        });
    } catch (error) {
        console.error('Error fetching user gamification stats:', error);
        res.status(500).json({ msg: 'Server error while fetching user stats' });
    }
});

// Debug endpoint to fix complaints missing department field
// Fix gamification for all staff members
router.get('/fix-gamification', async (req, res) => {
    try {
        console.log('🎯 [Admin] Starting gamification fix for all staff...');
        
        // Find all staff members
        const staffMembers = await User.find({ role: 'staff' });
        console.log(`Found ${staffMembers.length} staff members`);

        let updatedCount = 0;
        for (const staff of staffMembers) {
            console.log(`\n👤 Processing: ${staff.name} (${staff.city}, ${staff.department})`);
            
            // Count resolved complaints for this staff member
            const resolvedCount = await Complaint.countDocuments({
                status: 'RESOLVED',
                $or: [
                    { assignedTo: staff._id },
                    { assignedUsers: staff._id }
                ]
            });

            // Calculate points based on resolved complaints
            const basePoints = resolvedCount * 10; // 10 points per resolved complaint
            
            // Determine badge based on points
            let badge = 'Rookie';
            if (basePoints >= 1000) badge = 'Municipal Legend';
            else if (basePoints >= 500) badge = 'City Champion';
            else if (basePoints >= 250) badge = 'Expert Fixer';
            else if (basePoints >= 100) badge = 'Problem Solver';

            // Update user with gamification data
            await User.findByIdAndUpdate(staff._id, {
                $set: {
                    points: basePoints,
                    resolutionStreak: resolvedCount,
                    topFixerBadge: badge
                }
            });

            console.log(`  ✅ ${staff.name}: ${resolvedCount} resolved → ${basePoints} points → ${badge}`);
            updatedCount++;
        }

        console.log(`✅ Fixed gamification for ${updatedCount} staff members`);
        
        res.json({
            msg: `Fixed gamification for ${updatedCount} staff members`,
            staffCount: staffMembers.length,
            updated: updatedCount
        });
        
    } catch (error) {
        console.error('❌ Error fixing gamification:', error);
        res.status(500).json({ msg: 'Error fixing gamification', error: error.message });
    }
});

router.get('/fix-complaint-departments', async (req, res) => {
    try {
        console.log('🔧 [Admin Debug] Starting comprehensive complaint fix...');
        
        const departmentMap = {
            // Capital case (from AI)
            Sanitation: "Sanitation",
            Plumbing: "Plumbing", 
            Structural: "Structural",
            Electrical: "Electrical",
            // Lowercase (from user input/frontend)
            sanitation: "Sanitation",
            plumbing: "Plumbing",
            structural: "Structural",
            electrical: "Electrical"
        };
        
        // Find complaints without department field or with null department
        const complaintsMissingDept = await Complaint.find({
            $or: [
                { department: { $exists: false } },
                { department: null },
                { department: '' }
            ]
        });
        
        console.log(`🔧 Found ${complaintsMissingDept.length} complaints missing department`);
        
        let deptFixedCount = 0;
        for (const complaint of complaintsMissingDept) {
            const mappedDept = departmentMap[complaint.category];
            if (mappedDept) {
                await Complaint.findByIdAndUpdate(complaint._id, {
                    department: mappedDept
                });
                console.log(`🔧 Fixed dept: ${complaint.title}: ${complaint.category} -> ${mappedDept}`);
                deptFixedCount++;
            }
        }
        
        console.log(`✅ Fixed ${deptFixedCount} complaint departments`);

        // Step 2: Reassign complaints to appropriate staff members
        const staffMembers = await User.find({ role: 'staff' }).select('_id name city department');
        console.log(`👥 Found ${staffMembers.length} staff members`);

        let reassignedCount = 0;
        for (const staff of staffMembers) {
            // Find complaints that should be assigned to this staff member
            const complaintsToAssign = await Complaint.find({
                city: staff.city,
                department: staff.department,
                status: { $in: ['OPEN', 'IN_PROGRESS'] },
                assignedUsers: { $ne: staff._id } // Not already assigned to this staff
            });

            if (complaintsToAssign.length > 0) {
                console.log(`🎯 Assigning ${complaintsToAssign.length} complaints to ${staff.name} (${staff.city}, ${staff.department})`);
                
                for (const complaint of complaintsToAssign) {
                    await Complaint.findByIdAndUpdate(complaint._id, {
                        $addToSet: { assignedUsers: staff._id },
                        $set: { assignedTo: staff._id } // Set as primary assignee
                    });
                    console.log(`  ✅ Assigned: ${complaint.title}`);
                    reassignedCount++;
                }
            }
        }

        console.log(`🎯 Reassigned ${reassignedCount} complaints to staff members`);
        
        res.json({
            msg: `Comprehensive fix completed`,
            departmentsFix: {
                totalFound: complaintsMissingDept.length,
                fixed: deptFixedCount
            },
            reassignments: {
                staffCount: staffMembers.length,
                complaintsReassigned: reassignedCount
            }
        });
        
    } catch (error) {
        console.error('❌ Error fixing complaint departments:', error);
        res.status(500).json({ msg: 'Error fixing complaint departments', error: error.message });
    }
});

export default router;