// Comprehensive fix for complaint assignments and departments
import mongoose from 'mongoose';
import { Complaint } from './src/models/Complaint.js';
import { User } from './src/models/User.js';

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

async function fixComplaints() {
    try {
        await mongoose.connect('mongodb://localhost:27017/resolvehub');
        console.log('Connected to MongoDB');

        // Step 1: Fix department fields for complaints with null departments
        const complaintsWithoutDept = await Complaint.find({
            $or: [
                { department: null },
                { department: { $exists: false } },
                { department: '' }
            ]
        });

        console.log(`\n📊 Found ${complaintsWithoutDept.length} complaints with missing departments`);

        let deptFixedCount = 0;
        for (const complaint of complaintsWithoutDept) {
            const mappedDept = departmentMap[complaint.category];
            if (mappedDept) {
                await Complaint.findByIdAndUpdate(complaint._id, {
                    department: mappedDept
                });
                console.log(`✅ Fixed dept: ${complaint.title} (${complaint.category}) -> ${mappedDept}`);
                deptFixedCount++;
            } else {
                console.log(`❌ No mapping for: ${complaint.title} (${complaint.category})`);
            }
        }

        // Step 2: Find staff members and reassign complaints
        const staffMembers = await User.find({ role: 'staff' }).select('_id name city department');
        console.log(`\n👥 Found ${staffMembers.length} staff members:`);
        staffMembers.forEach(staff => {
            console.log(`  - ${staff.name} (${staff.city}, ${staff.department})`);
        });

        // Step 3: Reassign complaints to appropriate staff members
        let reassignedCount = 0;
        for (const staff of staffMembers) {
            // Find complaints in the same city and department that should be assigned to this staff
            const complaintsToAssign = await Complaint.find({
                city: staff.city,
                department: staff.department,
                status: { $in: ['OPEN', 'IN_PROGRESS'] },
                $and: [
                    { assignedTo: { $ne: staff._id } }, // Not already assigned to this staff
                    { assignedUsers: { $ne: staff._id } } // Not in assignedUsers either
                ]
            });

            if (complaintsToAssign.length > 0) {
                console.log(`\n🔄 Reassigning ${complaintsToAssign.length} complaints to ${staff.name} (${staff.city}, ${staff.department})`);
                
                for (const complaint of complaintsToAssign) {
                    // Add this staff member to assignedUsers if not already there
                    const updateData = {
                        $addToSet: { assignedUsers: staff._id }
                    };
                    
                    // If no primary assignee, make this staff the primary assignee
                    if (!complaint.assignedTo || complaint.assignedTo.toString() === '68e90e25f38fb3a896a7b815') { // Global Admin ID
                        updateData.assignedTo = staff._id;
                    }
                    
                    await Complaint.findByIdAndUpdate(complaint._id, updateData);
                    console.log(`  ✅ ${complaint.title}`);
                    reassignedCount++;
                }
            }
        }

        console.log(`\n📈 SUMMARY:`);
        console.log(`  ✅ Fixed ${deptFixedCount} complaint departments`);
        console.log(`  ✅ Reassigned ${reassignedCount} complaints to staff members`);

        // Step 4: Show final state for Prayagraj structural complaints
        const prayagrajStructural = await Complaint.find({ 
            city: 'Prayagraj', 
            department: 'Structural',
            status: { $in: ['OPEN', 'IN_PROGRESS'] }
        }).populate('assignedTo', 'name department').populate('assignedUsers', 'name department');

        console.log(`\n🏗️  Final Prayagraj Structural Complaints (${prayagrajStructural.length}):`);
        prayagrajStructural.forEach(c => {
            console.log(`  - ${c.title}`);
            console.log(`    📍 Assigned To: ${c.assignedTo?.name || 'None'} (${c.assignedTo?.department || 'N/A'})`);
            console.log(`    👥 Assigned Users: ${c.assignedUsers.map(u => `${u.name} (${u.department})`).join(', ') || 'None'}`);
        });

        mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        mongoose.disconnect();
    }
}

fixComplaints();