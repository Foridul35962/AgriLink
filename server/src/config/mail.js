import dotenv from 'dotenv'
dotenv.config()
import axios from "axios";

export const sendBrevoMail = async (to, subject, html) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.SENDER_EMAIL,
          name: "AgriLink",
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );
  } catch (error) {
    console.error(
      "Brevo Mail Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const generateVerificationMail = (otp) => {
  const currentYear = new Date().getFullYear();
  return {
    subject: 'Verify Your AgraLink Account ✅',
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; min-height: 100%;">
        <div style="max-width: 550px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
          
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">AgraLink</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; font-weight: 400;">Your Journey to Wellness Starts Here</p>
          </div>

          <div style="padding: 40px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 22px; text-align: center;">Verify Your Email</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 30px;">
              Thank you for joining AgraLink! To complete your registration and secure your account, please use the verification code below:
            </p>

            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: #f1f5f9; border: 2px solid #e2e8f0; color: #4f46e5; font-size: 36px; font-weight: 800; padding: 18px 45px; border-radius: 15px; letter-spacing: 8px;">
                ${otp}
              </div>
              <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                This code is valid for <strong>5 minutes</strong>.
              </p>
            </div>

            <div style="background-color: #fdf2f2; border-radius: 10px; padding: 15px; text-align: center;">
              <p style="color: #b91c1c; font-size: 13px; margin: 0;">
                For your security, never share this code with anyone.
              </p>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${currentYear} AgraLink Inc. All rights reserved. <br>
              If you did not create an account, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `
  };
};

export const generatePasswordResetMail = (otp) => {
  const currentYear = new Date().getFullYear();
  return {
    subject: 'Reset Your Password 🔐',
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fffafb; padding: 40px 10px; min-height: 100%;">
        <div style="max-width: 550px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.04); border: 1px solid #fee2e2;">
          
          <div style="background: linear-gradient(135deg, #e11d48, #be123c); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">AgraLink</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Security & Account Recovery</p>
          </div>

          <div style="padding: 40px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 22px; text-align: center;">Password Reset Request</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 30px;">
              We received a request to reset your AgraLink password. Use the following One-Time Password (OTP) to proceed:
            </p>

            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: #fff1f2; border: 2px solid #fecdd3; color: #e11d48; font-size: 36px; font-weight: 800; padding: 18px 45px; border-radius: 15px; letter-spacing: 8px;">
                ${otp}
              </div>
              <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                Expires in <strong>5 minutes</strong>.
              </p>
            </div>

            <div style="border-left: 4px solid #e11d48; background-color: #f8fafc; padding: 15px; border-radius: 0 8px 8px 0;">
              <p style="color: #334155; font-size: 13px; margin: 0; line-height: 1.5;">
                <strong>Didn't request this?</strong> If you didn't try to reset your password, your account is still safe, and you can safely ignore this email.
              </p>
            </div>
          </div>

          <div style="background: #fdfcfc; padding: 25px; text-align: center; border-top: 1px solid #fee2e2;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${currentYear} AgraLink Security Team. <br>
              Protecting your health data with care.
            </p>
          </div>
        </div>
      </div>
    `
  };
};