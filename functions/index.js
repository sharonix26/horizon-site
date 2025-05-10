const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const axios = require("axios");


const GMAIL_CLIENT_ID = defineSecret("GMAIL_CLIENT_ID");
const GMAIL_CLIENT_SECRET = defineSecret("GMAIL_CLIENT_SECRET");
const GMAIL_REFRESH_TOKEN = defineSecret("GMAIL_REFRESH_TOKEN");
const GMAIL_EMAIL = defineSecret("GMAIL_EMAIL");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ✅ Google Sheets Setup
const SHEET_ID = "1H844vfYMQ-tshhMYmlIhof_XlpiBC7QLui4Ky5-Judc";
const GOOGLE_SERVICE_ACCOUNT = defineSecret("GOOGLE_SERVICE_ACCOUNT");
const serviceAccount = JSON.parse(GOOGLE_SERVICE_ACCOUNT.value());

const auth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
);
const sheets = google.sheets({ version: "v4", auth });

// ✅ reCAPTCHA Verification
const RECAPTCHA_SECRET = defineSecret("RECAPTCHA_SECRET");

async function verifyCaptcha(token) {
  const secret = RECAPTCHA_SECRET.value(); 
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
  );
  return response.data.success;
}

// ✅ Email Sender using OAuth2
const nodemailer = require("nodemailer");

async function sendEmail({ company, email, phone, order }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: GMAIL_EMAIL.value(),
      clientId: GMAIL_CLIENT_ID.value(),
      clientSecret: GMAIL_CLIENT_SECRET.value(),
      refreshToken: GMAIL_REFRESH_TOKEN.value(),
    },
  });

  try {
    await transporter.sendMail({
      from: `"Horizon Contact" <${GMAIL_EMAIL.value()}>`,
      to: GMAIL_EMAIL.value(),
      subject: "New Lead Captured!",
      html: `
        <h2>New Submission</h2>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Order:</strong> ${order}</p>
      `,
    });

    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    throw err;
  }
}

// ✅ Main Form Endpoint
app.post("/submit", async (req, res) => {
  const { company, email, phone, order, captchaToken } = req.body;

  const captchaOk = await verifyCaptcha(captchaToken);
  if (!captchaOk) {
    return res.status(400).json({ message: "⚠️ CAPTCHA verification failed." });
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[new Date().toLocaleString(), company, email, phone, order]],
      },
    });

    await sendEmail({ company, email, phone, order });

    return res.status(200).json({ message: "✅ Submitted and emailed successfully!" });
  } catch (err) {
    console.error("❌ Error:", err);
    return res.status(500).json({ message: "⚠️ Submission failed." });
  }
});

// ✅ Firebase export 
exports.handleForm = onRequest(
  {
    secrets: [
      "GMAIL_CLIENT_ID",
      "GMAIL_CLIENT_SECRET",
      "GMAIL_REFRESH_TOKEN",
      "GMAIL_EMAIL",
      "RECAPTCHA_SECRET",
      "GOOGLE_SERVICE_ACCOUNT"
    ]
  },
  app
);

