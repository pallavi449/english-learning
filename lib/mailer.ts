import nodemailer from "nodemailer";

export const sendOTP = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,  // your Gmail address
      pass: process.env.EMAIL_PASS,  // your Gmail App Password
    },
  });

  await transporter.sendMail({
    from: `"Learn English" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verify your account</h2>
        <p>Your one-time password is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e40af; padding: 16px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in 5 minutes.</p>
      </div>
    `,
  });
};