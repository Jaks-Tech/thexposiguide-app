import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type ModuleKey = "upper" | "lower" | "pelvic";
type CacheItem = { markdown: string; expiresAt: number };

const TTL_MS = 24 * 60 * 60 * 1000;

// In-memory cache (best-effort)
const g = globalThis as unknown as {
  __projectionCache?: Map<string, CacheItem>;
};
g.__projectionCache ??= new Map<string, CacheItem>();
const cache = g.__projectionCache;

function moduleLabel(module: ModuleKey) {
  switch (module) {
    case "upper":
      return "Upper Extremities";
    case "lower":
      return "Lower Extremities";
    case "pelvic":
      return "Pelvic Girdle";
  }
}

function normalize(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

function cacheKey(module: ModuleKey, projectionName: string) {
  return `${module}::${normalize(projectionName).toLowerCase()}`;
}

function buildPrompt(module: ModuleKey, projectionName: string) {
  const section = moduleLabel(module);
  const topic = normalize(projectionName);

  return `
You are a certified radiography educator and clinical researcher.

Write a PROFESSIONAL, EXAM-READY markdown lesson using CURRENT authoritative medical sources.

SECTION: ${section}
TOPIC: ${topic}

You may use web research to ensure accuracy.

────────────────────────
CONTENT REQUIREMENTS
────────────────────────
1. Include VALID YAML frontmatter at the top:
---
title: "${topic}"
description: "Standard radiographic positioning techniques and evaluation criteria for ${topic}."
---

2. Use clear headings and bullet points.
3. Use concise, textbook-level instructional language.
4. Use metric and imperial units.
5. Base content on authoritative radiography and radiology sources.

────────────────────────
REQUIRED SECTIONS (IN THIS ORDER)
────────────────────────

## Patient Preparation
## Basic Projections
## Other Projections
## Image Evaluation Criteria
## Common Pathologies Demonstrated
## Common Positioning Errors
## Radiographic Tips

────────────────────────
REFERENCES
────────────────────────

## References
- Provide 3–6 authoritative sources.
- Include direct URLs.
- Prefer radiology societies, universities, textbooks, peer-reviewed medical sources.
- Do NOT fabricate links.
- Only include real, verifiable links.

────────────────────────
STYLE RULES
────────────────────────
- No emojis
- No casual language
- No AI disclaimers
- Output MARKDOWN ONLY
`.trim();
}

function cleanupExpired(now: number) {
  if (cache.size < 250) return;
  for (const [k, v] of cache.entries()) {
    if (v.expiresAt <= now) cache.delete(k);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const module = body?.module as ModuleKey | undefined;
    const projectionNameRaw = String(body?.projectionName ?? "");

    if (!module || !["upper", "lower", "pelvic"].includes(module)) {
      return NextResponse.json({ error: "Invalid module." }, { status: 400 });
    }

    const projectionName = normalize(projectionNameRaw);
    if (projectionName.length < 3) {
      return NextResponse.json(
        { error: "Projection name too short." },
        { status: 400 }
      );
    }

    const now = Date.now();
    cleanupExpired(now);

    const k = cacheKey(module, projectionName);
    const hit = cache.get(k);

    if (hit && hit.expiresAt > now) {
      return NextResponse.json({ cached: true, markdown: hit.markdown });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = buildPrompt(module, projectionName);

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1",
      temperature: 0.3,
      tools: [
        {
          type: "web_search",
        },
      ],
      input: prompt,
    });

    const markdown = response.output_text?.trim();

    if (!markdown) {
      return NextResponse.json(
        { error: "Empty model response." },
        { status: 500 }
      );
    }

    cache.set(k, { markdown, expiresAt: now + TTL_MS });

    return NextResponse.json({ cached: false, markdown });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
