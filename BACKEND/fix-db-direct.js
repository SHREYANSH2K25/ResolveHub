// Simple fix using direct MongoDB operations
import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'resolvehub';

async function fixComplaintsDB() {
    let client;
    try {
        client = new MongoClient(url);
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const complaintsCollection = db.collection('complaints');
        const usersCollection = db.collection('users');

        // Step 1: Fix departments
        console.log('🔧 Fixing complaint departments...');
        
        const departmentUpdates = [
            { category: 'structural', department: 'Structural' },
            { category: 'plumbing', department: 'Plumbing' },
            { category: 'sanitation', department: 'Sanitation' },
            { category: 'electrical', department: 'Electrical' }
        ];

        let totalFixed = 0;
        for (const update of departmentUpdates) {
            const result = await complaintsCollection.updateMany(
                { 
                    category: update.category,
                    $or: [
                        { department: null },
                        { department: { $exists: false } },
                        { department: '' }
                    ]
                },
                { $set: { department: update.department } }
            );
            console.log(`✅ Fixed ${result.modifiedCount} ${update.category} complaints`);
            totalFixed += result.modifiedCount;
        }

        // Step 2: Find the structural staff in Prayagraj
        const structuralStaff = await usersCollection.findOne({
            role: 'staff',
            city: 'Prayagraj',
            department: 'Structural'
        });

        if (structuralStaff) {
            console.log(`👤 Found structural staff: ${structuralStaff.name} (ID: ${structuralStaff._id})`);

            // Step 3: Assign structural complaints to the staff member
            const assignResult = await complaintsCollection.updateMany(
                {
                    city: 'Prayagraj',
                    department: 'Structural',
                    status: { $in: ['OPEN', 'IN_PROGRESS'] }
                },
                {
                    $set: { assignedTo: structuralStaff._id },
                    $addToSet: { assignedUsers: structuralStaff._id }
                }
            );

            console.log(`🎯 Assigned ${assignResult.modifiedCount} structural complaints to ${structuralStaff.name}`);
        } else {
            console.log('❌ No structural staff found in Prayagraj');
        }

        // Step 4: Verify results
        const finalComplaints = await complaintsCollection.find({
            city: 'Prayagraj',
            department: 'Structural',
            status: { $in: ['OPEN', 'IN_PROGRESS'] }
        }).toArray();

        console.log(`\n📊 Final Status: ${finalComplaints.length} structural complaints in Prayagraj`);
        finalComplaints.forEach(c => {
            console.log(`  - ${c.title} -> Assigned to: ${c.assignedTo}`);
        });

        console.log(`\n✅ Fix completed! Fixed ${totalFixed} departments and reassigned complaints.`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

fixComplaintsDB();