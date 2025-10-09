import twilio from 'twilio'
import sgMail from '@sendgrid/mail'
import 'dotenv/config'
import {User} from '../models/User.js'

// twilio client initialised for authentication
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
)

//sendgrid api key set for email authentications
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// sending sms notifications
export const sendSmsNotification = async(toPhoneNumber, message) => {
    try {
        // creating a message and sending
        await twilioClient.messages.create({
            body : message,
            from : process.env.TWILIO_PHONE_NUMBER,
            to: toPhoneNumber
        });

        console.log(`SMS sent successfully to ${toPhoneNumber}`);
    }
    catch(err){
        console.error('Twilio SMS error: ', err.message);
    }
}

// send email notifications using sendgrid
export const sendEmailNotifications = async(toEmail, subject, htmlContent) => {
    // create email message object to send
    const msg = {
        to : toEmail,
        from : process.env.ADMIN_EMAIL,
        subject : subject,
        html : htmlContent,
    };

    try{
        console.log('Attempting to send email:', {
            to: toEmail,
            from: process.env.ADMIN_EMAIL,
            subject: subject
        });
        
        // send email
        const response = await sgMail.send(msg);
        console.log(`✅ Email sent successfully to ${toEmail}`, response[0].statusCode);
        return { success: true, response };
    } catch(error){
        console.error('❌ SendGrid Email error:', {
            message: error.message,
            code: error.code,
            response: error.response?.body
        });
        
        // Check for specific SendGrid errors
        if (error.code === 401) {
            console.error('❌ SendGrid API Key is invalid or unauthorized');
        } else if (error.code === 403) {
            console.error('❌ SendGrid API Key does not have permission to send emails');
        } else if (error.response?.body?.errors) {
            console.error('❌ SendGrid validation errors:', error.response.body.errors);
        }
        
        throw error;
    }
};

// notify citizen about status change
export const notifyCitizenOfStatusChange = async(complaint) => {
    try {
        // lookup for the citizen's contact info
        const citizen = await User.findById(complaint.submittedBy).select('name email phone');
        if(!citizen) {
            console.log('Citizen not found for complaint:', complaint._id);
            return;
        }

        console.log(`Sending notifications for complaint ${complaint._id} to citizen ${citizen.name}`);

        // prepare content
        const statusMsg = `Your Complaint (ID : ${complaint._id}) status has been updated to ${complaint.status}.`;
        const emailSubject = `ResolveHub Status Update : ${complaint.status}`;
        const emailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Complaint Status Update</h1>
                <p>Dear ${citizen.name},</p>
                <p>${statusMsg}</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Complaint ID:</strong> ${complaint._id}<br>
                    <strong>New Status:</strong> ${complaint.status}<br>
                    <strong>Updated:</strong> ${new Date().toLocaleString()}
                </div>
                <p>Thank you for your patience.</p>
                <p>Best regards,<br>ResolveHub Team</p>
            </div>
        `;

        // send notifications with proper error handling
        const notifications = [];
        
        if(citizen.email){
            console.log(`Sending email to: ${citizen.email}`);
            notifications.push(sendEmailNotifications(citizen.email, emailSubject, emailHTML));
        }

        if(citizen.phone){
            console.log(`Sending SMS to: ${citizen.phone}`);
            notifications.push(sendSmsNotification(citizen.phone, statusMsg));
        }

        // Wait for all notifications to complete
        await Promise.allSettled(notifications);
        console.log('All notifications sent successfully');
        
    } catch(error) {
        console.error('Error in notifyCitizenOfStatusChange:', error);
    }
};