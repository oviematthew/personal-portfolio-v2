import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Escapes user input before it's interpolated into the outbound email's
// HTML body. This form has no database, so there's no SQL layer to inject
// into, but unescaped input here would let someone inject markup/scripts
// into the email itself, which is the equivalent risk in this code path.
function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req) {
  try {
    const form = await req.formData();

    const captcha = form.get("captcha");
    if (!captcha) {
      return NextResponse.json({ error: "Captcha missing" }, { status: 400 });
    }

    const verifyCaptcha = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`,
      { method: "POST" }
    );
    const captchaResult = await verifyCaptcha.json();

    if (!captchaResult.success) {
      return NextResponse.json({ error: "Invalid captcha" }, { status: 400 });
    }

    // Re-validate server-side. Client-side checks can always be bypassed by
    // posting to this route directly, so this is the real gate.
    const fullName = (form.get("fullName") || "").toString().trim();
    const email = (form.get("email") || "").toString().trim();
    const message = (form.get("message") || "").toString().trim();

    if (!fullName || fullName.length > 100) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!message || message.length > 5000) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const htmlMessage = `
      <h2>You’ve Got Mail 📩</h2>
      <hr />
      <p><strong>Full Name:</strong> ${escapeHtml(fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong><br/> ${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      <hr />
      <p style="font-size: 0.9rem; color: #888;">
        Submitted on ${new Date().toLocaleString()} via <a href="https://oviematthew.com" target="_blank">oviematthew.com</a>.
      </p>
    `;

    const transporter = nodemailer.createTransport({
      host: "mail.oviematthew.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Oviematthew Website" <${process.env.SMTP_USER}>`,
      to: process.env.RECEIVER,
      replyTo: email,
      subject: "Website Contact Form",
      html: htmlMessage,
    });

    return new Response("Email sent", { status: 200 });
  } catch (err) {
    return new Response("Email failed to send", { status: 500 });
  }
}
