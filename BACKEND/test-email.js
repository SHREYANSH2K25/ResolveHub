import 'dotenv/config'
import sgMail from '@sendgrid/mail'

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function testEmail() {
    console.log('Testing SendGrid email...');
    console.log('API Key:', process.env.SENDGRID_API_KEY ? 'Set' : 'Not set');
    console.log('Admin Email:', process.env.ADMIN_EMAIL);
    
    const msg = {
        to: process.env.ADMIN_EMAIL, // Send to admin email for testing
        from: process.env.ADMIN_EMAIL,
        subject: 'SendGrid Test Email from ResolveHub',
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h1>Test Email</h1>
                <p>This is a test email from ResolveHub to verify SendGrid configuration.</p>
                <p>Sent at: ${new Date().toISOString()}</p>
            </div>
        `
    };

    try {
        console.log('Sending test email...');
        const response = await sgMail.send(msg);
        console.log('✅ Test email sent successfully!');
        console.log('Response status:', response[0].statusCode);
        console.log('Response headers:', response[0].headers);
    } catch (error) {
        console.error('❌ Test email failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response body:', JSON.stringify(error.response.body, null, 2));
        }
    }
}

testEmail();