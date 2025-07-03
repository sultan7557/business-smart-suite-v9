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
      <p>Hello ${name},</p>
      <p>You have been invited by ${invitedBy} to join the RKMS Portal.</p>
      <p>Please click on the following link to accept your invitation and set up your account:</p>
      <p><a href="${inviteLink}">${inviteLink}</a></p>
      <p>This invitation link will expire soon. If you have any questions, please contact the administrator.</p>
      <p>Thank you,</p>
      <p>The RKMS Portal Team</p>
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
  const resetToken = sign({ userId: userId }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/set-password?t=${resetToken}`; // Changed from token to t for shorter URL

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Welcome to RKMS Portal! Set Your Password`,
    html: `
      <p>Hello ${name},</p>
      <p>Welcome to the RKMS Portal! Your account has been activated.</p>
      <p>Please click on the following link to set your password:</p>
      <p><a href="${resetLink}">Set Your Password</a></p>
      <p>This password reset link will expire in 1 hour for security reasons.</p>
      <p>If you did not expect this email, please contact the administrator immediately.</p>
      <p>Thank you,</p>
      <p>The RKMS Portal Team</p>
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