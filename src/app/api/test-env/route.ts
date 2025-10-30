export async function GET() {
  return Response.json({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing",
  });
}
