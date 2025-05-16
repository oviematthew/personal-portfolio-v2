// app/api/log-ref/route.js (App Router)
import nodemailer from "nodemailer";

export async function POST(request) {
  const { ref } = await request.json();

  if (!ref) {
    return new Response("Missing ref", { status: 400 });
  }

  // Only notify for specific refs
  const allowedRefs = ["github", "resume", "linkedin", "immigration"];
  if (!allowedRefs.includes(ref)) {
    console.log("Ref not tracked visit:", ref);
    return new Response("Ref not tracked", { status: 204 });
  }

  const transporter = nodemailer.createTransport({
    host: "mail.oviematthew.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const mailOptions = {
    from: `"Website Ref Tracker" <${process.env.SMTP_USER}>`,
    to: process.env.GMAIL_EMAIL,
    subject: `New ${ref.toUpperCase()} referral visit`,
    text: `Someone visited your site from ${ref} at ${new Date().toLocaleString()}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Ref Tracker email sent:", ref);
    return new Response("Email sent", { status: 200 });
  } catch (error) {
    console.error("Email error:", error);
    return new Response("Email failed", { status: 500 });
  }
}
