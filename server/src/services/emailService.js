import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const requiredVariables = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM",
  ];

  for (const variable of requiredVariables) {
    if (!process.env[variable]) {
      throw new Error(`Missing email configuration: ${variable}`);
    }
  }

  const port = Number(process.env.SMTP_PORT);

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

// Escape user-provided text before inserting it into HTML.
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

// Reusable email layout
const emailLayout = (title, content) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>

    <body style="
      margin: 0;
      padding: 30px 15px;
      background: #f4f5f9;
      font-family: Arial, sans-serif;
      color: #1f2937;
    ">

      <div style="
        max-width: 560px;
        margin: auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
      ">

        <div style="
          background: #4f46e5;
          padding: 25px;
          text-align: center;
          color: white;
        ">
          <h1 style="margin: 0;">SkillConnect</h1>
          <p style="margin-bottom: 0;">Discover skills. Connect. Grow.</p>
        </div>

        <div style="padding: 30px;">
          <h2>${title}</h2>
          ${content}
        </div>

        <div style="
          padding: 20px;
          background: #f8fafc;
          text-align: center;
          font-size: 12px;
          color: #64748b;
        ">
          <p>SkillConnect — University of Ilorin</p>
          <p>If you did not request this email, you can safely ignore it.</p>
        </div>

      </div>
    </body>
  </html>
`;

// Send an email verification link
export const sendVerificationEmail = async (user, token) => {
  const verificationUrl =
    `${process.env.CLIENT_URL}/verify-email/${encodeURIComponent(token)}`;

  const safeName = escapeHtml(user.fullName);

  const html = emailLayout(
    "Verify your email address",
    `
      <p>Hello ${safeName},</p>

      <p>
        Thank you for registering with SkillConnect.
        Please verify your email address to continue.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="
          display: inline-block;
          background: #4f46e5;
          color: white;
          padding: 14px 25px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
        ">
          Verify Email Address
        </a>
      </div>

      <p>This link expires in 24 hours.</p>

      <p>
        If the button does not work, copy this link into your browser:
      </p>

      <p style="word-break: break-all;">
        ${verificationUrl}
      </p>
    `
  );

  return getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: "Verify your SkillConnect email address",
    text: `Hello ${user.fullName}, verify your email using: ${verificationUrl}. This link expires in 24 hours.`,
    html,
  });
};

// Send a password-reset link
export const sendPasswordResetEmail = async (user, token) => {
  const resetUrl =
    `${process.env.CLIENT_URL}/reset-password/${encodeURIComponent(token)}`;

  const safeName = escapeHtml(user.fullName);

  const html = emailLayout(
    "Reset your password",
    `
      <p>Hello ${safeName},</p>

      <p>
        We received a request to reset your SkillConnect password.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="
          display: inline-block;
          background: #4f46e5;
          color: white;
          padding: 14px 25px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
        ">
          Reset Password
        </a>
      </div>

      <p>
        This link expires in 15 minutes and can only be used once.
      </p>

      <p>
        If you did not request a password reset, ignore this email.
        Your existing password will remain unchanged.
      </p>

      <p>For security, do not share this link with anyone.</p>
    `
  );

  return getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: "Reset your SkillConnect password",
    text: `Hello ${user.fullName}, reset your password using: ${resetUrl}. This link expires in 15 minutes.`,
    html,
  });
};

// Verify SMTP configuration
export const verifyEmailConnection = async () => {
  return getTransporter().verify();
};