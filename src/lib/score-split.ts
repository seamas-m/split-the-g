import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SCORING_PROMPT = `You are an expert judge for "Splitting the G" — a Guinness pint challenge.

"Splitting the G" means the liquid level in the glass sits right at the middle of the letter G in the Guinness logo on the glass, splitting it perfectly in half. The ideal pour has a clean, flat line between the dark stout and the creamy white head, with that line cutting exactly through the centre of the G.

Score this pint image from 0.0 to 10.0 based on:
- **G placement (50%)**: Does the liquid line split the G in the logo? Perfect centre = full marks. Off-centre or no G visible = lower score.
- **Line clarity (30%)**: Is the boundary between the dark stout and the white head clean and flat? Wavy, foamy, or unclear lines score lower.
- **Head quality (20%)**: Is the head white, dense, and the right height? Overflowing, no head, or dirty head reduces the score.

If this doesn't appear to be a Guinness pint photo, return 0.0.

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
