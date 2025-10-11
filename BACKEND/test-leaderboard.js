import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import { Complaint } from './src/models/Complaint.js';

async function testLeaderboard() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/resolvehub');
        console.log('✅ Connected to MongoDB');

        // Get all staff members
        const allStaff = await User.find({ role: 'staff' })
            .select('name fullname points resolutionStreak topFixerBadge city createdAt')
            .lean();

        console.log('\n📊 All Staff Members:');
        console.log('='.repeat(80));

        for (let staff of allStaff) {
            // Get complaint resolution count for each staff
            const resolvedCount = await Complaint.countDocuments({
                assignedTo: staff._id,
                status: { $in: ['RESOLVED', 'AUTO-CLOSED'] }
            });

            console.log(`Name: ${staff.fullname || staff.name}`);
            console.log(`Points: ${staff.points || 0}`);
            console.log(`Resolved Complaints: ${resolvedCount}`);
            console.log(`Resolution Streak: ${staff.resolutionStreak || 0}`);
            console.log(`Badge: ${staff.topFixerBadge || 'None'}`);
            console.log(`City: ${staff.city}`);
            console.log(`Created: ${staff.createdAt}`);
            console.log('-'.repeat(50));
        }

        // Test the current sorting logic
        console.log('\n🏆 Sorted Leaderboard (Current Logic):');
        console.log('='.repeat(80));

        const staffWithResolvedCounts = await Promise.all(
            allStaff.map(async (staff) => {
                const resolvedCount = await Complaint.countDocuments({
                    assignedTo: staff._id,
                    status: { $in: ['RESOLVED', 'AUTO-CLOSED'] }
                });

                return {
                    ...staff,
                    resolvedComplaints: resolvedCount
                };
            })
        );

        // Apply the new sorting logic
        const sortedStaff = staffWithResolvedCounts.sort((a, b) => {
            // First by points (descending)
            if (b.points !== a.points) {
                return (b.points || 0) - (a.points || 0);
            }
            // Then by resolved complaints count (descending)
            if (b.resolvedComplaints !== a.resolvedComplaints) {
                return b.resolvedComplaints - a.resolvedComplaints;
            }
            // Then by resolution streak (descending)
            if (b.resolutionStreak !== a.resolutionStreak) {
                return (b.resolutionStreak || 0) - (a.resolutionStreak || 0);
            }
            // Finally by creation date (ascending - older staff first as tie-breaker)
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        sortedStaff.forEach((staff, index) => {
            console.log(`${index + 1}. ${staff.fullname || staff.name}`);
            console.log(`   Points: ${staff.points || 0} | Resolved: ${staff.resolvedComplaints} | Streak: ${staff.resolutionStreak || 0}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testLeaderboard();