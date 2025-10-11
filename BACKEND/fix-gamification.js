// Fix gamification for existing users
import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import { Complaint } from './src/models/Complaint.js';

async function fixGamification() {
    try {
        await mongoose.connect('mongodb://localhost:27017/resolvehub');
        console.log('Connected to MongoDB');

        // Step 1: Initialize gamification fields for all staff members
        const staffMembers = await User.find({ role: 'staff' });
        console.log(`Found ${staffMembers.length} staff members`);

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
                    resolutionStreak: resolvedCount, // For now, set streak = resolved count
                    topFixerBadge: badge
                }
            });

            console.log(`  ✅ Updated: ${resolvedCount} resolved → ${basePoints} points → ${badge} badge`);
        }

        // Step 2: Show updated staff data
        console.log(`\n📊 Updated Staff Gamification Data:`);
        const updatedStaff = await User.find({ role: 'staff' }).select('name city department points resolutionStreak topFixerBadge');
        updatedStaff.forEach(staff => {
            console.log(`  - ${staff.name} (${staff.city}, ${staff.department}): ${staff.points} pts, Streak: ${staff.resolutionStreak}, Badge: ${staff.topFixerBadge}`);
        });

        mongoose.disconnect();
        console.log('\n✅ Gamification fix completed!');
    } catch (error) {
        console.error('❌ Error:', error);
        mongoose.disconnect();
    }
}

fixGamification();