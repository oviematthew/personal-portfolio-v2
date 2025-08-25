import nodemailer from "nodemailer";

export async function logRef(ref, ip) {
  if (!ref) return;

  const allowedRefs = [
    "github",
    "resume",
    "linkedin",
    "immigration",
    "instagram",
  ];
  const sendEmail = allowedRefs.includes(ref);

  let location = "Unknown";

  // fetch location
  try {
    if (ip) {
      const res = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await res.json();
      if (data && data.country_name && data.city) {
        location = `${data.country_name}, ${data.city}`;
      }
    }
  } catch (err) {
    console.error("Failed to fetch IP location:", err);
  }

  const now = new Date();
  const easternTime = now.toLocaleString("en-US", {
    timeZone: "America/New_York",
    timeStyle: "medium",
    dateStyle: "medium",
  });

  // Log non allowed refs
  if (!sendEmail) {
    console.log(`Ref logged without email: ref=${ref}, location=${location}`);
    return;
  }

  // send email
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
    text: `Someone visited your site from "${ref}"\n📍 Location: ${location}\n🕒 Time (EST/EDT): ${easternTime}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Ref Tracker email sent:", ref);
  } catch (error) {
    console.error("Email error:", error);
  }
}
