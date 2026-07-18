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
    subject: 'Verify Your AgriLink Account ✅',
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; min-height: 100%;">
        <div style="max-width: 550px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
          
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">AgriLink</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; font-weight: 400;">Your Journey to Wellness Starts Here</p>
          </div>

          <div style="padding: 40px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 22px; text-align: center;">Verify Your Email</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 30px;">
              Thank you for joining AgriLink! To complete your registration and secure your account, please use the verification code below:
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
              &copy; ${currentYear} AgriLink Inc. All rights reserved. <br>
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
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">AgriLink</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Security & Account Recovery</p>
          </div>

          <div style="padding: 40px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 22px; text-align: center;">Password Reset Request</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 30px;">
              We received a request to reset your AgriLink password. Use the following One-Time Password (OTP) to proceed:
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
              &copy; ${currentYear} AgriLink Security Team. <br>
              Protecting your health data with care.
            </p>
          </div>
        </div>
      </div>
    `
  };
};

export const generateApprovalMail = () => {
  const currentYear = new Date().getFullYear();
  return {
    subject: 'Welcome to AgriLink! Your Registration Request is Approved 🎉',
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; min-height: 100%;">
        <div style="max-width: 550px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
          
          <!-- Header Area -->
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">AgriLink</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; font-weight: 400;">Your Journey to Digital Agriculture Starts Here</p>
          </div>

          <!-- Body Area -->
          <div style="padding: 40px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 22px; text-align: center;">Account Approved!</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 30px;">
              Great news! The administrator has reviewed and <strong>approved</strong> your registration request. Your verification is complete, and full access has been granted to your account.
            </p>

            <!-- Login Info Box -->
            <div style="background-color: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
              <p style="color: #334155; font-size: 15px; margin: 0 0 10px 0; font-weight: 500;">
                You can now log in to your account using your registered:
              </p>
              <span style="display: inline-block; background: #ffffff; color: #059669; font-size: 14px; font-weight: 600; padding: 6px 16px; border-radius: 20px; border: 1px solid #e2e8f0; margin: 5px;">
                Email Address
              </span>
              <span style="display: inline-block; background: #ffffff; color: #059669; font-size: 14px; font-weight: 600; padding: 6px 16px; border-radius: 20px; border: 1px solid #e2e8f0; margin: 5px;">
                Password
              </span>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="YOUR_LOGIN_PAGE_URL" style="display: inline-block; background: #059669; color: #ffffff; font-size: 16px; font-weight: 600; padding: 14px 35px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);">
                Log In to Your Account
              </a>
            </div>

          </div>

          <!-- Footer Area -->
          <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${currentYear} AgriLink Inc. All rights reserved. <br>
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    `
  };
};

export const generateRejectionMail = () => {
  const currentYear = new Date().getFullYear();
  return {
    subject: 'Update regarding your AgriLink registration request ⚠️',
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; min-height: 100%;">
        <div style="max-width: 550px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
          
          <!-- Header Area -->
          <div style="background: linear-gradient(135deg, #ef4444, #b91c1c); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">AgriLink</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; font-weight: 400;">Your Journey to Digital Agriculture Starts Here</p>
          </div>

          <!-- Body Area -->
          <div style="padding: 40px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 22px; text-align: center;">Request Declined</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 30px;">
              Thank you for your interest in joining AgriLink. After reviewing your registration details, unfortunately, our administrator could not approve your request at this time.
            </p>

            <!-- Warning/Info Box -->
            <div style="background-color: #fef2f2; border: 1px dashed #fca5a5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
              <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 500; line-height: 1.5;">
                This usually happens due to incomplete profile details, incorrect information, or failing to meet our verification criteria.
              </p>
            </div>

            <!-- Notice text -->
            <p style="color: #64748b; font-size: 14px; text-align: center; line-height: 1.5; margin-bottom: 10px;">
              If you believe this was a mistake or wish to submit your request again with valid information, you can always sign up fresh from our platform.
            </p>
          </div>

          <!-- Footer Area -->
          <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${currentYear} AgriLink Inc. All rights reserved. <br>
              If you have any queries regarding this decision, feel free to reply to this email.
            </p>
          </div>
        </div>
      </div>
    `
  };
};

export const generateWarningMail = (topic) => {
  const currentYear = new Date().getFullYear();
  return {
    subject: 'Important: Account Warning Notification - AgriLink ⚠️',
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; min-height: 100%;">
        <div style="max-width: 550px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
          
          <!-- Header Area (Warning Theme) -->
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">AgriLink</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; font-weight: 400;">Account Safety & Community Guidelines</p>
          </div>

          <!-- Body Area -->
          <div style="padding: 40px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 22px; text-align: center;">Official Warning</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 30px;">
              We have received a formal report regarding recent activity on your account. After reviewing the case, our administration team has issued a formal warning for violating our community guidelines.
            </p>

            <!-- Warning/Violation Box -->
            <div style="background-color: #fffbeb; border: 1px dashed #fcd34d; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
              <p style="color: #92400e; font-size: 13px; text-transform: uppercase; font-weight: 700; margin-bottom: 5px; letter-spacing: 0.5px;">Reason for Report</p>
              <p style="color: #78350f; font-size: 15px; margin: 0; font-weight: 600; line-height: 1.5;">
                ${topic || 'Violation of AgriLink Community Standards'}
              </p>
            </div>

            <!-- Notice text -->
            <p style="color: #64748b; font-size: 14px; text-align: center; line-height: 1.5; margin-bottom: 10px;">
              Please ensure your future behavior aligns with our platform policies. Further violations or multiple reports may lead to <strong>permanent suspension</strong> of your AgriLink account.
            </p>
          </div>

          <!-- Footer Area -->
          <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${currentYear} AgriLink Inc. All rights reserved. <br>
              If you believe this report was unfair or wish to appeal, please reply to this email.
            </p>
          </div>
        </div>
      </div>
    `
  };
};

export const generateRemovalMail = (reason) => {
  const currentYear = new Date().getFullYear();
  return {
    subject: 'Important: Your AgriLink Account Has Been Removed 🚫',
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; min-height: 100%;">
        <div style="max-width: 550px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
          
          <!-- Header Area (Danger/Removal Theme) -->
          <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">AgriLink</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; font-weight: 400;">Account Termination Notice</p>
          </div>

          <!-- Body Area -->
          <div style="padding: 40px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 22px; text-align: center;">Account Removed</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 30px;">
              We regret to inform you that your AgriLink account has been permanently removed by our administration team due to repeated or severe violations of our terms of service and community guidelines.
            </p>

            <!-- Reason Box -->
            <div style="background-color: #fef2f2; border: 1px dashed #f87171; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
              <p style="color: #991b1b; font-size: 13px; text-transform: uppercase; font-weight: 700; margin-bottom: 5px; letter-spacing: 0.5px;">Reason for Removal</p>
              <p style="color: #7f1d1d; font-size: 15px; margin: 0; font-weight: 600; line-height: 1.5;">
                ${reason || 'Severe violation of AgriLink Community Policies.'}
              </p>
            </div>

            <!-- Notice text -->
            <p style="color: #64748b; font-size: 14px; text-align: center; line-height: 1.5; margin-bottom: 10px;">
              As a result of this action, you will no longer be able to access your profile, services, or any associated data on the AgriLink platform. 
            </p>
          </div>

          <!-- Footer Area -->
          <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${currentYear} AgriLink Inc. All rights reserved. <br>
              This is a system-generated notification regarding your account status.
            </p>
          </div>
        </div>
      </div>
    `
  };
};

export const generateAuctionWinnerMail = ({
  aratdarName,
  productName,
  bidAmount
}) => {
  const currentYear = new Date().getFullYear();

  return {
    subject: `🎉 Congratulations! You Won the Bid for ${productName}` ,

    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px;">
        <div style="max-width: 560px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">AgriLink</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Bid Winner Confirmation</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 24px; text-align: center;">
              🎉 Congratulations, ${aratdarName}!
            </h2>

            <p style="color: #475569; line-height: 1.7; font-size: 16px; text-align: center; margin-bottom: 30px;">
              Your bid has been <strong>successfully selected as the winning bid</strong> for the following product listed on AgriLink.
            </p>

            <!-- Product Details -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px; margin-bottom: 30px;">
              <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 18px; font-size: 18px;">Winning Bid Details</h3>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Product</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${productName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Winning Bid</td>
                  <td style="padding: 8px 0; color: #15803d; font-size: 16px; font-weight: 800; text-align: right;">৳${bidAmount}</td>
                </tr>
              </table>
            </div>

            <!-- Action Box -->
            <div style="background-color: #ecfdf5; border: 1px solid #86efac; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
              <p style="color: #166534; font-size: 13px; text-transform: uppercase; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">Next Step</p>
              <p style="color: #14532d; font-size: 16px; margin: 0; font-weight: 600; line-height: 1.6;">
                Please <strong>confirm your order within the AgriLink platform</strong> to proceed with payment, delivery, and transaction completion.
              </p>
            </div>

            <p style="color: #64748b; font-size: 14px; text-align: center; line-height: 1.6; margin-bottom: 0;">
              Thank you for participating in the AgriLink auction marketplace. We appreciate your trust in connecting directly with farmers for fair and transparent trade.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${currentYear} AgriLink Inc. All rights reserved.<br>
              This is a system-generated notification regarding your auction result.
            </p>
          </div>
        </div>
      </div>
    `
  };
};