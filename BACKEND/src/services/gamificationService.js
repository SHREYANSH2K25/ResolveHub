import { User } from "../models/User.js";
import { Complaint } from "../models/Complaint.js";

const POINT_VALUES = {
    BASE_RESOLUTION: 10,
    SPEED_THRESHOLD_HOURS: 72,
    MAX_SPEED_BONUS: 20,
    POSITIVE_FEEDBACK_BONUS: 15,
}

// helper function to calculate bonus
const calculateSpeedBonus = (createdAt, resolutionDate) => {
    const thresholdMs = POINT_VALUES.SPEED_THRESHOLD_HOURS*3600*1000;
    const resolutionMs = resolutionDate.getTime() - createdAt.getTime();

    if(resolutionMs <= thresholdMs){
        const speedFactor = 1 - (resolutionMs/thresholdMs);
        return Math.round(speedFactor*POINT_VALUES.MAX_SPEED_BONUS);
    }
    return 0;
}

// function add bonus and points
export const updateLeaderboardPoints = async(staffId, complaint, trigger) => {
    let pointsAwarded = 0;
    if(!staffId) return {totalPointsAwarded : 0};

    if(trigger === 'RESOLUTION' && complaint.resolutionDate && complaint.createdAt) {
        pointsAwarded+=POINT_VALUES.BASE_RESOLUTION;
        pointsAwarded+=calculateSpeedBonus(complaint.createdAt, complaint.resolutionDate);
    }

    if(trigger === 'FEEDBACK' && complaint.feedbackRating >= 4) {
        pointsAwarded+=POINT_VALUES.POSITIVE_FEEDBACK_BONUS;
    }

    if(pointsAwarded > 0) {
        // Get current user to calculate new badge
        const user = await User.findById(staffId);
        if (!user) return { totalPointsAwarded: 0 };

        const newPoints = user.points + pointsAwarded;
        const newStreak = trigger === 'RESOLUTION' ? user.resolutionStreak + 1 : user.resolutionStreak;
        const newBadge = calculateUserBadge(newPoints);

        // update points, streak, and badge in User docs
        await User.findByIdAndUpdate(staffId, {
            $inc : {
                points: pointsAwarded,
                resolutionStreak: trigger === 'RESOLUTION' ? 1 : 0
            },
            $set: {
                topFixerBadge: newBadge.name
            }
        })

        // stores how many points this complaint was worth(for analytics)
        await Complaint.findByIdAndUpdate(complaint._id, {
            $set : {
                pointsAwarded: pointsAwarded
            }
        })

        console.log(`[Gamification] ✅ Awards Summary for ${staffId}:`);
        console.log(`  - Points Awarded: ${pointsAwarded}`);
        console.log(`  - New Badge: ${newBadge.name}`);
        console.log(`  - Current Streak: ${newStreak}`);
        console.log(`  - Total Points: ${newPoints}`);
    }

    return { totalPointsAwarded : pointsAwarded};
}

// Badge system configuration
const BADGES = {
    ROOKIE: { name: 'Rookie', minPoints: 0, icon: '🆕', color: '#6B7280' },
    SOLVER: { name: 'Problem Solver', minPoints: 100, icon: '⚡', color: '#3B82F6' },
    EXPERT: { name: 'Expert Fixer', minPoints: 250, icon: '🛠️', color: '#8B5CF6' },
    CHAMPION: { name: 'City Champion', minPoints: 500, icon: '🏆', color: '#F59E0B' },
    LEGEND: { name: 'Municipal Legend', minPoints: 1000, icon: '🌟', color: '#EF4444' }
};

const ACHIEVEMENT_BADGES = {
    SPEED_DEMON: { name: 'Speed Demon', icon: '⚡', color: '#10B981', description: 'Resolve 10 complaints in under 24 hours' },
    FEEDBACK_MASTER: { name: 'Feedback Master', icon: '⭐', color: '#F59E0B', description: 'Receive 20+ positive feedback ratings' },
    STREAK_MASTER: { name: 'Streak Master', icon: '🔥', color: '#EF4444', description: 'Maintain a 15+ resolution streak' },
    DEPARTMENT_HERO: { name: 'Department Hero', icon: '🦸', color: '#8B5CF6', description: 'Top performer in department' }
};

// Calculate user badge based on points
export const calculateUserBadge = (points) => {
    const badges = Object.values(BADGES).reverse(); // Start from highest
    for (const badge of badges) {
        if (points >= badge.minPoints) {
            return badge;
        }
    }
    return BADGES.ROOKIE;
};

// Get leaderboard data
export const getLeaderboard = async (city, limit = 10) => {
    try {
        console.log(`[Gamification] Fetching leaderboard for city: ${city}, limit: ${limit}`);
        const topStaff = await User.find({ 
            role: 'staff',
            city: city,
            points: { $gte: 0 } // Include staff with 0 points too
        })
        .select('name fullname email department points resolutionStreak topFixerBadge createdAt');

        // Get complaint resolution stats and sort properly
        const staffWithStats = await Promise.all(
            topStaff.map(async (staff) => {
                const complaintsResolved = await Complaint.countDocuments({
                    assignedTo: staff._id,
                    status: 'RESOLVED'
                });
                return { ...staff.toObject(), complaintsResolved };
            })
        );

        // Sort by: 1. Points (desc), 2. Complaints resolved (desc), 3. Resolution streak (desc)
        const sortedStaff = staffWithStats.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.complaintsResolved !== a.complaintsResolved) return b.complaintsResolved - a.complaintsResolved;
            if (b.resolutionStreak !== a.resolutionStreak) return b.resolutionStreak - a.resolutionStreak;
            return new Date(a.createdAt) - new Date(b.createdAt); // Earlier created = higher rank if tied
        }).slice(0, limit);

        // Transform the sorted staff data
        const leaderboardWithStats = sortedStaff.map((staff) => {
            const currentBadge = calculateUserBadge(staff.points);
            
            return {
                _id: staff._id,
                fullname: staff.fullname || staff.name,
                name: staff.name,
                email: staff.email,
                department: staff.department,
                city: city,
                totalPoints: staff.points,
                points: staff.points,
                currentStreak: staff.resolutionStreak,
                resolutionStreak: staff.resolutionStreak,
                complaintsResolved: staff.complaintsResolved,
                topFixerBadge: staff.topFixerBadge || currentBadge.name,
                badge: currentBadge,
                badges: staff.topFixerBadge ? [{
                    name: staff.topFixerBadge,
                    icon: currentBadge.icon,
                    color: currentBadge.color
                }] : []
            };
        });

        console.log(`[Gamification] Successfully fetched ${leaderboardWithStats.length} staff members for leaderboard`);
        return leaderboardWithStats;
    } catch (error) {
        console.error('[Gamification] Error fetching leaderboard:', error);
        throw error;
    }
};

// Get gamification stats for admin dashboard
export const getGamificationStats = async (city) => {
    try {
        // Get all staff in the city
        const allStaff = await User.find({ role: 'staff', city: city })
            .select('name fullname points resolutionStreak topFixerBadge department');
        
        // Calculate total points awarded
        const totalPoints = allStaff.reduce((sum, staff) => sum + staff.points, 0);
        
        // Get top performer
        const topPerformer = await User.findOne({ 
            role: 'staff', 
            city: city, 
            points: { $gt: 0 } 
        })
        .select('name fullname points department topFixerBadge resolutionStreak')
        .sort({ points: -1 });

        // Calculate badge distribution
        const badgeDistribution = {};
        allStaff.forEach(staff => {
            const badge = calculateUserBadge(staff.points);
            badgeDistribution[badge.name] = (badgeDistribution[badge.name] || 0) + 1;
        });

        // Get average points and streaks
        const averagePoints = allStaff.length > 0 ? Math.round(totalPoints / allStaff.length) : 0;
        const totalActiveStreaks = allStaff.filter(staff => staff.resolutionStreak > 0).length;
        const averageStreak = allStaff.length > 0 ? 
            Math.round(allStaff.reduce((sum, staff) => sum + staff.resolutionStreak, 0) / allStaff.length) : 0;

        // Get total resolved complaints
        const totalResolvedComplaints = await Complaint.countDocuments({
            status: 'RESOLVED',
            assignedTo: { $in: allStaff.map(staff => staff._id) }
        });

        // Get department-wise performance
        const departmentStats = {};
        for (const staff of allStaff) {
            if (!departmentStats[staff.department]) {
                departmentStats[staff.department] = {
                    totalStaff: 0,
                    totalPoints: 0,
                    totalStreaks: 0,
                    resolvedComplaints: 0
                };
            }
            departmentStats[staff.department].totalStaff += 1;
            departmentStats[staff.department].totalPoints += staff.points;
            departmentStats[staff.department].totalStreaks += staff.resolutionStreak;

            const resolvedCount = await Complaint.countDocuments({
                assignedTo: staff._id,
                status: 'RESOLVED'
            });
            departmentStats[staff.department].resolvedComplaints += resolvedCount;
        }

        return {
            totalStaff: allStaff.length,
            totalPoints,
            totalBadges: allStaff.filter(staff => staff.topFixerBadge && staff.topFixerBadge !== 'Rookie').length,
            averagePoints,
            averageStreak,
            totalActiveStreaks,
            totalResolvedComplaints,
            avgResolutionTime: 24, // This could be calculated from actual data
            topPerformer: topPerformer ? {
                name: topPerformer.fullname || topPerformer.name,
                points: topPerformer.points,
                department: topPerformer.department,
                streak: topPerformer.resolutionStreak,
                badge: calculateUserBadge(topPerformer.points)
            } : null,
            badgeDistribution,
            departmentStats,
            availableBadges: Object.values(BADGES),
            recentAchievements: [] // This could be populated with recent badge achievements
        };
    } catch (error) {
        console.error('[Gamification] Error fetching stats:', error);
        throw error;
    }
};