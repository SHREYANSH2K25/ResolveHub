// Quick script to fix department fields in complaints
import mongoose from 'mongoose';
import { Complaint } from './src/models/Complaint.js';

const departmentMap = {
    // Lowercase mapping
    sanitation: "Sanitation",
    plumbing: "Plumbing", 
    structural: "Structural",
    electrical: "Electrical",
    // Capital case mapping
    Sanitation: "Sanitation",
    Plumbing: "Plumbing",
    Structural: "Structural", 
    Electrical: "Electrical"
};

async function fixDepartments() {
    try {
        await mongoose.connect('mongodb://localhost:27017/resolvehub');
        console.log('Connected to MongoDB');

        // Find complaints with null department
        const complaints = await Complaint.find({
            $or: [
                { department: null },
                { department: { $exists: false } },
                { department: '' }
            ]
        });

        console.log(`Found ${complaints.length} complaints with missing department`);

        let fixedCount = 0;
        for (const complaint of complaints) {
            const mappedDept = departmentMap[complaint.category];
            if (mappedDept) {
                await Complaint.findByIdAndUpdate(complaint._id, {
                    department: mappedDept
                });
                console.log(`Fixed: ${complaint.title} (${complaint.category}) -> ${mappedDept}`);
                fixedCount++;
            } else {
                console.log(`No mapping for category: ${complaint.category}`);
            }
        }

        console.log(`✅ Fixed ${fixedCount} complaints`);

        // Show updated complaints from Prayagraj
        const prayagrajComplaints = await Complaint.find({ city: 'Prayagraj' })
            .select('title category department city')
            .sort({ createdAt: -1 });

        console.log('\nPrayagraj complaints after fix:');
        prayagrajComplaints.forEach(c => {
            console.log(`- ${c.title}: ${c.category} -> ${c.department}`);
        });

        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        mongoose.disconnect();
    }
}

fixDepartments();