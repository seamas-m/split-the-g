import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SCORING_PROMPT = `You are a judge for "Splitting the G" — a Guinness pint challenge.

"Splitting the G" means the liquid level sits at roughly the middle of the glass, with a clean separation between the dark stout below and the creamy white head above. The ideal pour has a flat, clearly defined line between the two layers.

Score generously using this guide:
- **9.0–10.0**: Excellent split — the line between dark and cream is clean and flat, layers are clearly distinct, head looks good. A pour most people would be proud of.
- **8.0–8.9**: Very good split — clean separation, maybe a slightly uneven line or imperfect head but clearly a well-executed pour.
- **7.0–7.9**: Decent split — the layers are visible but the line is a bit rough, or the head isn't quite right.
- **4.0–6.9**: Attempted split — you can see the effort but the layers aren't well defined or the ratio is off.
- **0–3.9**: Poor or unrecognisable — heavily mixed, no visible split, or not a Guinness pint photo.

Be generous. A clean-looking split with a visible flat line between dark and cream should score 8.5 or above. Reserve scores below 5 for genuinely poor or unclear pours. A 10 is achievable for a textbook pour.

Respond with ONLY a single decimal number between 0.0 and 10.0. No explanation, no text, just the number.`;


export async function scoreSplit(imageUrl: string): Promise<number | null> {
  try {
    // Fetch the image and convert to base64
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mediaType = (response.headers.get("content-type") ?? "image/jpeg") as
      | "image/jpeg"
      | "image/png"
      | "image/gif"
      | "image/webp";

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 16,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            { type: "text", text: SCORING_PROMPT },
          ],
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const score = parseFloat(text);

    if (isNaN(score)) return null;
    return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
  } catch (err) {
    console.error("[scoreSplit] error:", err);
    return null;
  }
}
