import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SCORING_PROMPT = `You are a judge for "Splitting the G" — a Guinness pint challenge.

The challenge is called "Splitting the G" because the liquid level should sit right at the G in the GUINNESS logo on the glass, splitting the letter in half. The G is roughly in the middle of the glass. A good split means the dark stout fills approximately 75–80% of the glass and the creamy white head sits on top taking up the remaining 20–25% — contained neatly within the rim.

Two things matter equally:
1. **Position** — the line between dark and cream should be near the middle of the glass (at the G). A huge overflowing head, or a line that is too high or too low, is a bad split regardless of how clean the line looks.
2. **Line clarity** — the boundary between dark stout and white head should be flat and clean, not mixed or foamy throughout.

Classify the pint into exactly one of these four tiers:

**SPOT_ON** — The line is close to mid-glass (near the G), the dark stout fills roughly 75–80% of the glass, the head is white and contained within the rim, and the line is clean. Both position AND clarity are good.

**GRAND** — Decent attempt. Either the position is slightly off (a bit too high or low) OR the line is a bit uneven — but not both badly wrong at the same time.

**NOT_THE_WORST** — Noticeably off. The head is overflowing or takes up way more than a quarter of the glass, or the line is far from mid-glass, or the layers are significantly mixed.

**KEEP_AT_IT** — Very poor split, heavily mixed, head massively overflowing, or not a Guinness pint photo.

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
