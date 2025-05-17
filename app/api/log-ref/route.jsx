import nodemailer from "nodemailer";

export async function POST(request) {
  const { ref, location } = await request.json();

  if (!ref) {
    return new Response("Missing ref", { status: 400 });
  }

  // Only allow certain ref values to be tracked

  const allowedRefs = ["github", "resume", "linkedin", "immigration"];
  if (!allowedRefs.includes(ref)) {
    console.log("Ref not tracked visit:", ref);
    return new Response("Ref not tracked", { status: 204 });
  }

  // Date and time formatting
  const now = new Date();
  const easternTime = now.toLocaleString("en-US", {
    timeZone: "America/New_York",
    timeStyle: "medium",
    dateStyle: "medium",
  });

  // Send email using nodemailer
  //Using environment variables for SMTP credentials
  const transporter = nodemailer.createTransport({
    host: "mail.oviematthew.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  //Email template to be sent
  const mailOptions = {
    from: `"Website Ref Tracker" <${process.env.SMTP_USER}>`,
    to: process.env.GMAIL_EMAIL,
    subject: `New ${ref.toUpperCase()} referral visit`,
    text: `Someone visited your site from "${ref}"\n\n📍 Location: ${
      location || "Unknown" // Fallback if location is not provided
    }\n🕒 Time (EST/EDT): ${easternTime}`,
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
