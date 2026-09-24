/**
 * Receives quote requests from the homepage quote card.
 *
 * TODO: deliver the request somewhere (email to info@chachainsurance.com, a CRM, etc.).
 * Until then it is validated and logged on the server only.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim() : "");

  // Bots fill the hidden "website" field; accept quietly and drop it.
  if (str("website")) return Response.json({ ok: true });

  const name = str("name");
  const email = str("email");
  const phone = str("phone").replace(/\D/g, "");
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || phone.length < 10) {
    return Response.json({ error: "Name, email and a 10 digit phone number are required." }, { status: 422 });
  }

  console.info("[quote request]", {
    cover: str("cover"),
    name,
    email,
    phone,
    zip: str("zip"),
    notes: str("notes").slice(0, 2000),
  });

  return Response.json({ ok: true });
}
