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
    subject: `You're invited to join the RKMS Portal!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Hello ${name},</h2>
        <p style="color: #666; line-height: 1.6;">You have been invited by <strong>${invitedBy}</strong> to join the RKMS Portal.</p>
        <p style="color: #666; line-height: 1.6;">Please click on the following link to accept your invitation and set up your account:</p>
        <div style="margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Accept Invitation</a>
        </div>
        <p style="color: #666; line-height: 1.6;">If the button above doesn't work, you can copy and paste this link into your browser:</p>
        <p style="color: #007bff; word-break: break-all; margin: 20px 0;">
          <a href="${inviteLink}" style="color: #007bff; text-decoration: underline;">${inviteLink}</a>
        </p>
        <p style="color: #666; line-height: 1.6;"><strong>Important:</strong> This invitation link will expire soon for security reasons.</p>
        <p style="color: #666; line-height: 1.6;">Thank you,<br>The RKMS Portal Team</p>
      </div>
    `,
    text: `
      Hello ${name},
      
      You have been invited by ${invitedBy} to join the RKMS Portal.
      
      Please click on the following link to accept your invitation and set up your account:
      ${inviteLink}
      
      This invitation link will expire soon for security reasons.
      
      Thank you,
      The RKMS Portal Team
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

export async function sendWelcomeAndSetPasswordEmail(to: string, name: string, userId: string) {
  const resetToken = sign({ userId: userId }, JWT_SECRET, { expiresIn: '1h' });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/set-password?t=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Welcome to RKMS Portal! Set Your Password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Hello ${name},</h2>
        <p style="color: #666; line-height: 1.6;">Welcome to the RKMS Portal! Your account has been activated and is ready to use.</p>
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
        <p style="color: #666; line-height: 1.6;">Thank you,<br>The RKMS Portal Team</p>
      </div>
    `,
    text: `
      Hello ${name},
      
      Welcome to the RKMS Portal! Your account has been activated and is ready to use.
      
      To complete your account setup, please set your password by clicking this link:
      ${resetLink}
      
      Important: This password setup link will expire in 1 hour for security reasons.
      
      If you did not expect this email or have any questions, please contact the administrator immediately.
      
      Thank you,
      The RKMS Portal Team
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