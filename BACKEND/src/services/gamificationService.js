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