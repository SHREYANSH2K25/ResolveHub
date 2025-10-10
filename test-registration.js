// Simple test script to debug staff registration
const axios = require('axios');

async function testRegistration() {
    try {
        // First, generate a verification code
        console.log('1. Generating verification code...');
        const codeResponse = await axios.post('http://localhost:5000/api/admin/verification-code', {}, {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhlOTBlMjVmMzhmYjNhODk2YTdiODE4Iiwicm9sZSI6ImFkbWluIn0sImlhdCI6MTc2MDEyMDAxNCwiZXhwIjoxNzYwMjA2NDE0fQ.hsBkFbCPdAUJtgO40BDCgv8FCicZURj8mIohr9Zd5JA',
                'Content-Type': 'application/json'
            }
        });
        
        const verificationCode = codeResponse.data.code;
        console.log('✅ Verification code generated:', verificationCode);
        
        // Now test registration
        console.log('2. Testing staff registration...');
        const registrationData = {
            name: 'Test Staff Member',
            email: 'test-staff-' + Date.now() + '@example.com',
            password: 'password123',
            role: 'staff',
            city: 'Delhi',
            department: 'Sanitation',
            verificationcode: verificationCode
        };
        
        console.log('📝 Registration data:', registrationData);
        
        const registerResponse = await axios.post('http://localhost:5000/api/auth/register', registrationData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Registration successful!');
        console.log('Response:', registerResponse.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        console.error('Full error:', error);
    }
}

testRegistration();