import { json } from "@sveltejs/kit";
import { createClient } from "@kigathi/ai-agents";
import { env } from "$env/dynamic/private";

const sdk = createClient({
  apiKey: env.OPENAI_API_KEY,
});

export async function POST({ request }) {
  const body = await request.json();

  if (!body?.text || typeof body.text !== "string") {
    return json({ message: "`text` is required." }, { status: 422 });
  }

  try {
    const speech = await sdk.tts.speak({
      text: body.text,
      instructions:
        typeof body.instructions === "string" ? body.instructions : undefined,
    });

    return json({
      audio_base64: speech.audio_base64,
      mime_type: speech.mime_type,
      words: speech.words,
    });
  } catch (error: any) {
    return json(
      { message: error?.message || "Failed to generate read-aloud audio." },
      { status: 500 },
    );
  }
}
