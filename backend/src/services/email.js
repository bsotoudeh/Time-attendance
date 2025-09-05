import nodemailer from 'nodemailer';

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!host || !user || !pass) {
    console.warn('Email transport not fully configured; emails will be logged.');
    cachedTransporter = null;
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cachedTransporter;
}

export async function sendEmail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || 'no-reply@example.com';
  const transporter = getTransporter();
  if (!transporter) {
    console.log('EMAIL MOCK', { from, to, subject, text });
    return { mocked: true };
  }
  return transporter.sendMail({ from, to, subject, text, html });
}