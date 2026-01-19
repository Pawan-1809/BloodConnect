const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Email templates
const templates = {
  welcome: (user) => ({
    subject: 'Welcome to BloodConnect - Your Journey to Save Lives Begins!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🩸 BloodConnect</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Welcome, ${user.firstName}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for joining BloodConnect. You're now part of a community dedicated to saving lives through blood donation.
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            ${user.role === 'donor' 
              ? 'As a donor, you have the power to save up to 3 lives with each donation.' 
              : 'We\'re here to help you find the blood you need quickly and efficiently.'}
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} BloodConnect. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  bloodRequest: (donor, request) => ({
    subject: `Urgent: ${request.bloodGroup} Blood Needed - Can You Help?`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🆘 Urgent Blood Request</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hello ${donor.firstName},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            A patient urgently needs <strong>${request.bloodGroup}</strong> blood. Your blood type is compatible!
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Blood Group:</strong> ${request.bloodGroup}</p>
            <p style="margin: 5px 0;"><strong>Units Required:</strong> ${request.unitsRequired}</p>
            <p style="margin: 5px 0;"><strong>Urgency:</strong> <span style="color: ${request.urgency === 'emergency' ? '#dc2626' : '#f59e0b'};">${request.urgency.toUpperCase()}</span></p>
            <p style="margin: 5px 0;"><strong>Hospital:</strong> ${request.hospitalName}</p>
            <p style="margin: 5px 0;"><strong>Needed By:</strong> ${new Date(request.requiredBy).toLocaleDateString()}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/requests/${request._id}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View Request & Respond
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Every donation can save up to 3 lives. Thank you for being a hero! ❤️
          </p>
        </div>
      </div>
    `
  }),

  requestApproved: (user, request) => ({
    subject: 'Good News! Your Blood Request Has Been Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">✅ Request Approved</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hello ${user.firstName},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Great news! Your blood request for <strong>${request.bloodGroup}</strong> has been approved.
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            We're actively matching compatible donors. You will receive updates as donors respond.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/requests/${request._id}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Track Request
            </a>
          </div>
        </div>
      </div>
    `
  }),

  donationReminder: (donor, schedule) => ({
    subject: 'Reminder: Your Blood Donation Appointment Tomorrow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">📅 Donation Reminder</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hello ${donor.firstName},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            This is a friendly reminder about your upcoming blood donation appointment.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(schedule.date).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${schedule.time}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${schedule.venue?.name || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> ${schedule.venue?.address || 'N/A'}</p>
          </div>
          <h3 style="color: #1f2937;">Before Your Donation:</h3>
          <ul style="color: #4b5563; line-height: 1.8;">
            <li>Get a good night's sleep</li>
            <li>Eat a healthy meal before donating</li>
            <li>Drink plenty of water</li>
            <li>Bring a valid ID</li>
            <li>Wear comfortable clothes with sleeves that can be rolled up</li>
          </ul>
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            Thank you for your commitment to saving lives! 🩸❤️
          </p>
        </div>
      </div>
    `
  }),

  eligibilityRestored: (donor) => ({
    subject: 'Great News! You\'re Eligible to Donate Again',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 You Can Donate Again!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hello ${donor.firstName},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            The waiting period since your last donation has passed. You're now eligible to donate blood again!
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            There are patients waiting for your generous gift. Consider scheduling your next donation today.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/schedules" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Schedule Donation
            </a>
          </div>
        </div>
      </div>
    `
  }),

  passwordReset: (user, resetUrl) => ({
    subject: 'Password Reset Request - BloodConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔐 Password Reset</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hello ${user.firstName},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 10 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const transporter = createTransporter();
    const { subject, html } = templates[template](data);

    const mailOptions = {
      from: `"BloodConnect" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

// Send bulk emails
const sendBulkEmail = async (recipients, template, dataFn) => {
  const results = [];
  for (const recipient of recipients) {
    const result = await sendEmail(recipient.email, template, dataFn(recipient));
    results.push({ email: recipient.email, ...result });
  }
  return results;
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  templates
};
