import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type ModuleKey = "general" | "upper" | "lower" | "pelvic";
type CacheItem = {
  image: string;
  mimeType: string;
  planMarkdown: string;
  revisedPrompt: string;
  expiresAt: number;
};

const TTL_MS = 6 * 60 * 60 * 1000;

const g = globalThis as unknown as {
  __projectionVisualCache?: Map<string, CacheItem>;
};
g.__projectionVisualCache ??= new Map<string, CacheItem>();
const cache = g.__projectionVisualCache;

function normalize(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

function displayStudy(input: string) {
  return normalize(input)
    .replace(/\bx[\s-]?ray\b/gi, "radiographic")
    .replace(/\bradiograph\b/gi, "radiographic image")
    .replace(/\bpatient\b/gi, "positioning phantom");
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function isSafetyRejection(error: unknown) {
  const message = errorMessage(error).toLowerCase();
  return message.includes("safety") || message.includes("rejected");
}

function moduleLabel(module: ModuleKey) {
  switch (module) {
    case "upper":
      return "Upper Extremities";
    case "lower":
      return "Lower Extremities";
    case "pelvic":
      return "Pelvic Girdle";
    case "general":
      return "General Radiography";
  }
}

function cacheKey(module: ModuleKey, study: string) {
  return `${module}::${normalize(study).toLowerCase()}`;
}

function cleanupExpired(now: number) {
  if (cache.size < 80) return;
  for (const [key, value] of cache.entries()) {
    if (value.expiresAt <= now) cache.delete(key);
  }
}

function buildPlanPrompt(module: ModuleKey, study: string) {
  const section = moduleLabel(module);
  const topic = displayStudy(study);

  return `
You are a certified radiography educator.

Create a concise, exam-ready positioning blueprint for a generated teaching visual.

Topic: ${topic}
Anatomy module: ${section}

Use current authoritative radiography positioning standards. If the topic is broad, choose the most common standard projection and name it clearly.

Output markdown only, with these exact headings:

## Projection Selected
## Positioning
## Image Receptor
## Central Ray
## SID
## Collimation and Marker
## Final Image Must Show
## Image Evaluation Criteria

Rules:
- Include central ray direction and angle in degrees when applicable.
- Include SID in inches and centimeters.
- Include patient/part position, receptor orientation, centering point, marker side, and final anatomy demonstrated.
- Keep it short enough to fit next to an educational image.
- No diagnosis, treatment advice, or patient-specific interpretation.
`.trim();
}

function buildVisualPrompt(
  module: ModuleKey,
  study: string,
  planMarkdown: string,
  safeMode = false
) {
  const section = moduleLabel(module);
  const topic = displayStudy(study);

  return `
Create a polished radiography positioning storyboard for students.

Topic: ${topic}
Anatomy module: ${section}

Use this positioning blueprint as the source of truth:
${planMarkdown}

Use a synthetic training-lab illustration with a neutral positioning phantom, detector panel, tube stand, light field, angle arc, SID label, collimation borders, and side marker. The scene should look like a classroom diagram, not a real clinical photo or diagnostic study.

Storyboard layout:
1. Positioning: show the phantom/part position and label the projection selected.
2. Central ray and SID: show receptor placement, beam path, angle in degrees, centering point, and SID.
3. Collimation and marker: show field borders, receptor orientation, and R/L marker.
4. Final image: show a simplified grayscale detector result with the key anatomy and evaluation criteria.

Visual requirements:
- Use a clear four-panel layout.
- Include concise labels inside each panel.
- Labels must include Position, IR, CR, angle, SID, collimation, marker, and final image.
- Keep anatomy proportionally accurate for positioning education.
- Focus on equipment geometry, receptor placement, and beam direction.
- Avoid dense paragraphs, watermarks, logos, fictional branding, realistic people, or diagnostic interpretation.
- Professional, bright, modern radiography training aesthetic.
${safeMode ? "- Make the final panel more diagrammatic than anatomical, using simple outlines and arrows." : ""}
`.trim();
}

async function generatePlan(
  client: OpenAI,
  projectionModule: ModuleKey,
  study: string
) {
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1",
    temperature: 0.1,
    tools: [
      {
        type: "web_search",
      },
    ],
    input: buildPlanPrompt(projectionModule, study),
  });

  return response.output_text?.trim() || "";
}

async function generateImage(
  client: OpenAI,
  projectionModule: ModuleKey,
  study: string,
  planMarkdown: string,
  safeMode = false
) {
  return client.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
    prompt: buildVisualPrompt(projectionModule, study, planMarkdown, safeMode),
    n: 1,
    size: "1024x1024",
    quality: safeMode ? "medium" : "high",
    output_format: "png",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const projectionModule = (body?.module || "general") as ModuleKey;
    const studyRaw = String(body?.study ?? body?.projectionName ?? "");

    if (!["general", "upper", "lower", "pelvic"].includes(projectionModule)) {
      return NextResponse.json({ error: "Invalid module." }, { status: 400 });
    }

    const study = normalize(studyRaw);
    if (study.length < 3) {
      return NextResponse.json(
        { error: "Type a longer x-ray projection or anatomy request." },
        { status: 400 }
      );
    }

    const now = Date.now();
    cleanupExpired(now);

    const key = cacheKey(projectionModule, study);
    const hit = cache.get(key);
    if (hit && hit.expiresAt > now) {
      return NextResponse.json({ cached: true, ...hit });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const planMarkdown = await generatePlan(client, projectionModule, study);

    if (!planMarkdown) {
      return NextResponse.json(
        { error: "Empty positioning blueprint response." },
        { status: 500 }
      );
    }

    let response;
    try {
      response = await generateImage(
        client,
        projectionModule,
        study,
        planMarkdown
      );
    } catch (error: unknown) {
      if (!isSafetyRejection(error)) throw error;
      response = await generateImage(
        client,
        projectionModule,
        study,
        planMarkdown,
        true
      );
    }

    const image = response.data?.[0]?.b64_json;
    if (!image) {
      return NextResponse.json(
        { error: "Empty image generation response." },
        { status: 500 }
      );
    }

    const item: CacheItem = {
      image,
      mimeType: "image/png",
      planMarkdown,
      revisedPrompt: response.data?.[0]?.revised_prompt || "",
      expiresAt: now + TTL_MS,
    };

    cache.set(key, item);

    return NextResponse.json({ cached: false, ...item });
  } catch (e: unknown) {
    if (isSafetyRejection(e)) {
      return NextResponse.json(
        {
          error:
            "The visual request was blocked by the image safety system. Try wording it as a positioning diagram, for example: PA chest projection positioning.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: errorMessage(e) },
      { status: 500 }
    );
  }
}
