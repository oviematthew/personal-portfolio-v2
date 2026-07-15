import nodemailer from "nodemailer";

// Vercel's edge network attaches these to every request before it reaches
// the function, so this is instant and never rate-limited, unlike a
// third-party IP lookup API.
function getLocationFromVercelHeaders(headers) {
  const city = headers.get("x-vercel-ip-city");
  const country = headers.get("x-vercel-ip-country");
  const region = headers.get("x-vercel-ip-country-region");

  if (!city && !country) return null;

  const parts = [city && decodeURIComponent(city), region, country].filter(Boolean);
  return parts.join(", ");
}

// Fallback for local dev or hosts that don't set Vercel's geo headers.
async function getLocationFromIp(ip) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json();
    if (data && data.country_name && data.city) {
      return `${data.city}, ${data.country_name}`;
    }
  } catch (err) {
    console.error("Failed to fetch IP location:", err);
  }
  return null;
}

export async function POST(request) {
  const { ref } = await request.json();

  // Check if the ref parameter is present in the request body
  // This is important for tracking the source of the visit
  // and sending the email notification if applicable
  // The ref parameter is expected to be a string that indicates the source
  // of the visit, such as "github", "resume", "linkedin", etc.
  if (!ref) {
    return new Response("Missing ref", { status: 400 });
  }

  // Define allowed referrers
  // These are the referrers that will trigger an email to be sent
  const allowedRefs = ["github", "resume", "linkedin", "immigration", "instagram", "coverLetter", "twitch", "youtube", "tiktok"];
  const sendEmail = allowedRefs.includes(ref);

  let location = getLocationFromVercelHeaders(request.headers);

  // Vercel's edge network only attaches geo headers in production, so
  // local dev (and any non-Vercel host) falls back to an IP lookup.
  if (!location) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null;

    if (ip) {
      location = await getLocationFromIp(ip);
    }
  }

  location = location ?? "Unknown";

  //convert to eastern time
  const now = new Date();
  const easternTime = now.toLocaleString("en-US", {
    timeZone: "America/New_York",
    timeStyle: "medium",
    dateStyle: "medium",
  });

  // Log non allowed refs
  if (!sendEmail) {
    console.log(
      `Ref logged without sending email: ref origin is ${ref} from ${location}`
    );
    return new Response("Ref logged", { status: 200 });
  }

  // Send email for tracked ref
  const transporter = nodemailer.createTransport({
    host: "mail.oviematthew.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Email options
  // This includes the sender's email, recipient's email, subject, and body
  // The body of the email includes the referrer, location, and time of the visit
  const mailOptions = {
    from: `"Website Ref Tracker" <${process.env.SMTP_USER}>`,
    to: process.env.GMAIL_EMAIL,
    subject: `New ${ref.toUpperCase()} referral visit`,
    text: `Someone visited your site from "${ref}"\n\n📍 Location: ${location}\n🕒 Time (EST/EDT): ${easternTime}`,
  };

  // Send the email
  // This uses the nodemailer library to send the email
  // If the email is sent successfully, log the referrer and location
  // If there is an error, log the error message
  try {
    await transporter.sendMail(mailOptions);
    console.log("Ref Tracker email sent:", ref);
    return new Response("Email sent", { status: 200 });
  } catch (error) {
    console.error("Email error:", error);
    return new Response("Email failed", { status: 500 });
  }
}
