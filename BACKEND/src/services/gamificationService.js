import { User } from "../models/User.js";
import { Complaint } from "../models/Complaint.js"

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
        // update points in User docs
        await User.findByIdAndUpdate(staffId, {
            $inc : {
                points: pointsAwarded,
                resolutionStreak: trigger === 'RESOLUTION' ? 1 : 0
            }
        })

        // stores how many points this complaint was worth(for analytics)
        await Complaint.findByIdAndUpdate(complaint._id, {
            $set : {
                pointsAwarded: pointsAwarded
            }
        })

        console.log(`[Gamification] Total ${pointsAwarded} points awarded to ${staffId}`);
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
        const topStaff = await User.find({ 
            role: 'staff',
            city: city,
            points: { $gt: 0 } 
        })
        .select('name department points resolutionStreak')
        .sort({ points: -1 })
        .limit(limit);

        return topStaff.map(staff => ({
            id: staff._id,
            name: staff.name,
            department: staff.department,
            points: staff.points,
            resolutionStreak: staff.resolutionStreak,
            badge: calculateUserBadge(staff.points)
        }));
    } catch (error) {
        console.error('[Gamification] Error fetching leaderboard:', error);
        throw error;
    }
};

// Get gamification stats for admin dashboard
export const getGamificationStats = async (city) => {
    try {
        // Get all staff in the city
        const allStaff = await User.find({ role: 'staff', city: city });
        
        // Calculate total points awarded
        const totalPoints = allStaff.reduce((sum, staff) => sum + staff.points, 0);
        
        // Get top performer
        const topPerformer = await User.findOne({ 
            role: 'staff', 
            city: city, 
            points: { $gt: 0 } 
        })
        .select('name points')
        .sort({ points: -1 });

        // Calculate badge distribution
        const badgeDistribution = {};
        allStaff.forEach(staff => {
            const badge = calculateUserBadge(staff.points);
            badgeDistribution[badge.name] = (badgeDistribution[badge.name] || 0) + 1;
        });

        // Get average points
        const averagePoints = allStaff.length > 0 ? Math.round(totalPoints / allStaff.length) : 0;

        return {
            totalStaff: allStaff.length,
            totalPoints,
            averagePoints,
            topPerformer: topPerformer ? {
                name: topPerformer.name,
                points: topPerformer.points,
                badge: calculateUserBadge(topPerformer.points)
            } : null,
            badgeDistribution,
            availableBadges: Object.values(BADGES)
        };
    } catch (error) {
        console.error('[Gamification] Error fetching stats:', error);
        throw error;
    }
};