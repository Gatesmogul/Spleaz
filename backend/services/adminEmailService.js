'use strict';

const crypto = require('crypto');
const nodemailer = require('nodemailer');

const ADMIN_PASSWORD_SETUP_URL =
  process.env.ADMIN_PASSWORD_SETUP_URL ||
  'https://spleaz.onrender.com/admin/set-password';

function createMailer() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
  } = process.env;

  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASS
  ) {
    throw new Error(
      'SMTP configuration is missing. Configure SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.'
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

function createSetupUrl(token) {
  const separator =
    ADMIN_PASSWORD_SETUP_URL.includes('?')
      ? '&'
      : '?';

  return `${ADMIN_PASSWORD_SETUP_URL}${separator}token=${encodeURIComponent(
    token
  )}`;
}

async function sendAdminPasswordSetupEmail({
  email,
  token,
  adminRole,
}) {
  const transporter = createMailer();

  const setupUrl = createSetupUrl(token);

  const roleLabel =
    adminRole === 'founder_admin'
      ? 'Founder Admin'
      : adminRole === 'senior_admin'
        ? 'Senior Admin'
        : 'Junior Admin';

  const messageId = `<spleaz-admin-${crypto
    .randomBytes(12)
    .toString('hex')}@spleaz>`;

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER,

    to: email,

    subject:
      'Spleaz Administrator Password Setup',

    messageId,

    text: `
Spleaz Administrator Account

You have been authorized as a ${roleLabel}.

To securely create your Spleaz administrator password, use the link below:

${setupUrl}

This link expires in 30 minutes and can only be used once.

If you did not expect this message, please contact the Spleaz Founder Administration team.
`,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Spleaz Administrator Password Setup</title>
</head>

<body style="font-family: Arial, sans-serif; background:#f5f7fa; padding:30px;">

  <div style="
    max-width:600px;
    margin:0 auto;
    background:#ffffff;
    padding:35px;
    border-radius:12px;
  ">

    <h1 style="margin-top:0;">
      Spleaz Administrator Account
    </h1>

    <p>
      You have been authorized as a
      <strong>${roleLabel}</strong>.
    </p>

    <p>
      Use the button below to securely create your administrator password.
    </p>

    <p style="margin:30px 0;">
      <a
        href="${setupUrl}"
        style="
          display:inline-block;
          padding:14px 24px;
          background:#111827;
          color:#ffffff;
          text-decoration:none;
          border-radius:8px;
          font-weight:bold;
        "
      >
        Set Administrator Password
      </a>
    </p>

    <p>
      This password setup link expires in
      <strong>30 minutes</strong> and can only be used once.
    </p>

    <p style="color:#6b7280;">
      If you did not expect this email, contact the Spleaz Founder Administration team.
    </p>

  </div>

</body>
</html>
`,
  });
}

module.exports = {
  sendAdminPasswordSetupEmail,
};
