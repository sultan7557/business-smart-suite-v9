import nodemailer from 'nodemailer';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendInvitationEmail(to: string, name: string, invitedBy: string, inviteLink: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `You're invited to join Business Smart Suite!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Hello ${name},</h2>
        <p style="color: #666; line-height: 1.6;">You have been invited by <strong>${invitedBy}</strong> to join Business Smart Suite.</p>
        <p style="color: #666; line-height: 1.6;">Please click on the following link to accept your invitation and set up your account:</p>
        <div style="margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Accept Invitation</a>
        </div>
        <p style="color: #666; line-height: 1.6;">If the button above doesn't work, you can copy and paste this link into your browser:</p>
        <p style="color: #007bff; word-break: break-all; margin: 20px 0;">
          <a href="${inviteLink}" style="color: #007bff; text-decoration: underline;">${inviteLink}</a>
        </p>
        <p style="color: #666; line-height: 1.6;"><strong>Important:</strong> This invitation link will expire soon for security reasons.</p>
        <p style="color: #666; line-height: 1.6;">Thank you,<br>The Business Smart Suite Team</p>
      </div>
    `,
    text: `
      Hello ${name},
      
      You have been invited by ${invitedBy} to join Business Smart Suite.
      
      Please click on the following link to accept your invitation and set up your account:
      ${inviteLink}
      
      This invitation link will expire soon for security reasons.
      
      Thank you,
      The Business Smart Suite Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Invitation email sent successfully to', to);
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw new Error('Failed to send invitation email.');
  }
}

export async function sendDocumentExpiryNotification(
  to: string, 
  userName: string, 
  documentName: string, 
  supplierName: string, 
  expiryDate: Date, 
  documentUrl: string,
  daysUntilExpiry: number
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Document Expiry Reminder - ${documentName} - ${supplierName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6b46c1; margin: 0; font-size: 24px;">Business Smart Suite</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Document Expiry Notification</p>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
            <h2 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px;">⚠️ Document Expiry Warning</h2>
            <p style="color: #92400e; margin: 0; font-size: 16px;">
              <strong>${daysUntilExpiry === 1 ? '1 day' : `${daysUntilExpiry} days`}</strong> until expiry
            </p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Document Details:</h3>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px;">
              <p style="margin: 5px 0; color: #374151;"><strong>Document:</strong> ${documentName}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Supplier:</strong> ${supplierName}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Expiry Date:</strong> ${expiryDate.toLocaleDateString()}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Assigned To:</strong> ${userName}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${documentUrl}" style="background-color: #6b46c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              View Document
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; margin: 0; font-size: 14px; text-align: center;">
              This is an automated notification from Business Smart Suite.<br>
              Please ensure all documents are renewed before expiry to maintain compliance.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
Document Expiry Reminder - ${documentName} - ${supplierName}

Hello ${userName},

This is a reminder that the following document is expiring soon:

Document: ${documentName}
Supplier: ${supplierName}
Expiry Date: ${expiryDate.toLocaleDateString()}
Days Until Expiry: ${daysUntilExpiry === 1 ? '1 day' : `${daysUntilExpiry} days`}

Please review and renew this document before it expires to maintain compliance.

View Document: ${documentUrl}

This is an automated notification from Business Smart Suite.
Please ensure all documents are renewed before expiry.

Best regards,
The Business Smart Suite Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Document expiry notification sent successfully to', to);
  } catch (error) {
    console.error('Error sending document expiry notification:', error);
    throw new Error('Failed to send document expiry notification.');
  }
}

export async function sendWelcomeAndSetPasswordEmail(to: string, name: string, userId: string) {
  const resetToken = sign({ userId: userId }, JWT_SECRET, { expiresIn: '1h' });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/set-password?t=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Welcome to Business Smart Suite! Set Your Password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Hello ${name},</h2>
        <p style="color: #666; line-height: 1.6;">Welcome to Business Smart Suite! Your account has been activated and is ready to use.</p>
        <p style="color: #666; line-height: 1.6;"><strong>To complete your account setup, please set your password:</strong></p>
        <div style="margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Set Your Password</a>
        </div>
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="color: #856404; margin: 0;"><strong>Important:</strong> This password setup link will expire in 1 hour for security reasons.</p>
        </div>
        <p style="color: #666; line-height: 1.6;">If the button above doesn't work, you can copy and paste this link into your browser:</p>
        <p style="color: #28a745; word-break: break-all; margin: 20px 0;">
          <a href="${resetLink}" style="color: #28a745; text-decoration: underline;">${resetLink}</a>
        </p>
        <p style="color: #666; line-height: 1.6;">If you did not expect this email or have any questions, please contact the administrator immediately.</p>
        <p style="color: #666; line-height: 1.6;">Thank you,<br>The Business Smart Suite Team</p>
      </div>
    `,
    text: `
      Hello ${name},
      
      Welcome to Business Smart Suite! Your account has been activated and is ready to use.
      
      To complete your account setup, please set your password by clicking this link:
      ${resetLink}
      
      Important: This password setup link will expire in 1 hour for security reasons.
      
      If you did not expect this email or have any questions, please contact the administrator immediately.
      
      Thank you,
      The Business Smart Suite Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome and set password email sent successfully to', to);
  } catch (error) {
    console.error('Error sending welcome and set password email:', error);
    throw new Error('Failed to send welcome and set password email.');
  }
} 