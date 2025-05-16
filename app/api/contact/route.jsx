import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

    const getField = (key) => form.get(key) || "N/A";
    const fullName = getField("fullName");
    const email = getField("email");
    const message = getField("message");

    const htmlMessage = `
      <h2>You’ve Got Mail 📩</h2>
      <hr />
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br/> ${message}</p>
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
