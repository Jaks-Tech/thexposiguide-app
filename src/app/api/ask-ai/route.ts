import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return Response.json({ error: "Missing or invalid prompt" }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are XPosi AI — an expert radiography tutor. Provide clear, structured, and professional answers to exam or positioning questions.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
    });

    const answer =
      completion.choices?.[0]?.message?.content ?? "No response generated.";

    return Response.json({ answer });
  } catch (err) {
    console.error("AI error:", err);
    return Response.json(
      { error: "Failed to generate AI answer." },
      { status: 500 }
    );
  }
}
