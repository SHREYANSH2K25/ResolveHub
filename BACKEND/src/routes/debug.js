import express from 'express';
import { User } from '../models/User.js';
import { Complaint } from '../models/Complaint.js';

const router = express.Router();

// Debug endpoint to check leaderboard data
router.get('/debug-leaderboard', async (req, res) => {
    try {
        console.log('🔍 DEBUG: Fetching leaderboard data...');
        
        // Get all staff members
        const allStaff = await User.find({ role: 'staff' })
            .select('name fullname points resolutionStreak topFixerBadge city createdAt')
            .lean();

        console.log(`🔍 DEBUG: Found ${allStaff.length} staff members`);

        const staffWithResolvedCounts = await Promise.all(
            allStaff.map(async (staff) => {
                const resolvedCount = await Complaint.countDocuments({
                    assignedTo: staff._id,
                    status: { $in: ['RESOLVED', 'AUTO-CLOSED'] }
                });

                console.log(`🔍 DEBUG: Staff ${staff.fullname || staff.name} - Points: ${staff.points || 0}, Resolved: ${resolvedCount}, Streak: ${staff.resolutionStreak || 0}`);

                return {
                    id: staff._id,
                    name: staff.fullname || staff.name,
                    points: staff.points || 0,
                    resolvedComplaints: resolvedCount,
                    resolutionStreak: staff.resolutionStreak || 0,
                    topFixerBadge: staff.topFixerBadge || 'None',
                    city: staff.city,
                    createdAt: staff.createdAt
                };
            })
        );

        // Apply the sorting logic
        const sortedStaff = staffWithResolvedCounts.sort((a, b) => {
            // First by points (descending)
            if (b.points !== a.points) {
                return b.points - a.points;
            }
            // Then by resolved complaints count (descending)
            if (b.resolvedComplaints !== a.resolvedComplaints) {
                return b.resolvedComplaints - a.resolvedComplaints;
            }
            // Then by resolution streak (descending)
            if (b.resolutionStreak !== a.resolutionStreak) {
                return b.resolutionStreak - a.resolutionStreak;
            }
            // Finally by creation date (ascending - older staff first as tie-breaker)
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        res.json({
            message: 'Debug leaderboard data',
            totalStaff: allStaff.length,
            sortedLeaderboard: sortedStaff.map((staff, index) => ({
                rank: index + 1,
                ...staff
            }))
        });

    } catch (error) {
        console.error('❌ DEBUG: Error fetching leaderboard data:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;