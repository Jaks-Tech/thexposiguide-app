import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { title, description, unit } = await req.json();

  const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content: `
        You are an expert Academic Tutor. Format your response using clean Markdown:
        1. Use ### for section titles (e.g., ### Research Tips).
        2. Use bolding **text** for key terms.
        3. Use bullet points for steps.
        4. Keep sentences punchy and short.
        5. Use a "Pro-Tip" section at the end.
        
        Strictly follow this 3-section structure: Research, Structure, and Key Concepts.
      `
    },
    {
      role: "user",
      content: `Assignment: ${title}\nUnit: ${unit}\nDetails: ${description}`
    }
  ],
});


  return NextResponse.json({ guide: completion.choices[0].message.content });
}