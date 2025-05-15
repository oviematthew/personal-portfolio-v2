export async function POST(request) {
  const { ref } = await request.json();
  console.log("Referral:", ref);
  return new Response("OK");
}
