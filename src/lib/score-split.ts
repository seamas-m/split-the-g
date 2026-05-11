import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SCORING_PROMPT = `You are a judge for "Splitting the G" — a Guinness pint challenge.

"Splitting the G" means the liquid level sits at the middle of the glass, creating a clean horizontal line between the dark stout below and the white creamy head above.

Classify the pint into exactly one of these four tiers based on what you can see:

**SPOT_ON** — A genuinely well-executed split. The line between dark stout and white head is clearly visible, flat, and clean. The two layers are distinctly separate. Head is white and intact. This is a pour someone would be proud of.

**GRAND** — A decent attempt. There is visible separation between the dark and light layers but the line is slightly uneven, wavy, or the head is a bit off. Still clearly a split, just not perfect.

**NOT_THE_WORST** — The layers are mixed or hard to distinguish. There may be some separation but it's unclear, the ratio is significantly off, or the head is missing/dirty.

**KEEP_AT_IT** — Heavily mixed pint with no clear split visible, or this doesn't appear to be a Guinness pint photo at all.

Respond with ONLY one of these four words exactly as written: SPOT_ON, GRAND, NOT_THE_WORST, KEEP_AT_IT. No other text.`;


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

    const tierMap: Record<string, number> = {
      SPOT_ON: 9.0,
      GRAND: 7.5,
      NOT_THE_WORST: 5.0,
      KEEP_AT_IT: 2.0,
    };

    return tierMap[text] ?? null;
  } catch (err) {
    console.error("[scoreSplit] error:", err);
    return null;
  }
}
