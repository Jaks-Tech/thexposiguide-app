import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type ModuleKey = "upper" | "lower" | "pelvic";
type CacheItem = { markdown: string; expiresAt: number };

const TTL_MS = 24 * 60 * 60 * 1000;

// Best-effort in-memory cache (note: not reliable across serverless instances)
const g = globalThis as unknown as { __projectionCache?: Map<string, CacheItem> };
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
You are a certified radiography educator writing a clinical X-ray positioning guide.

Write a PROFESSIONAL, EXAM-READY markdown lesson for the following:

SECTION: ${section}
TOPIC: ${topic}

────────────────────────
CONTENT REQUIREMENTS
────────────────────────
1. Include VALID YAML frontmatter at the top:
---
title: "${topic}"
description: "Standard radiographic positioning techniques and evaluation criteria for ${topic}."
---

2. Use clear headings and bullet points.
3. Do NOT include citations, references, or external links.
4. Write in concise, instructional language used in radiography textbooks.
5. Use metric and imperial units where applicable.

────────────────────────
REQUIRED SECTIONS (IN THIS ORDER)
────────────────────────

## Patient Preparation
- Explain the procedure to the patient.
- Remove jewelry, rings, or metallic objects from the area of interest.
- Position the patient comfortably.
- Apply lead shielding when appropriate.

## Basic Projections
(If applicable, include more than one basic projection)

### Projection Name
**Positioning:**
- Describe patient position.
- Describe part position and rotation.
- Describe finger/limb positioning where applicable.

**Central Ray (CR):**
- Direction
- Anatomical landmark

**IR / Detector:**
- Placement and orientation

**SID (Source-to-Image Distance):**
- Standard SID in cm and inches.

**Collimation:**
- Anatomical coverage required.

## Other Projections
(Include specialty or alternate projections when applicable)

### Projection Name
Repeat the same sub-structure:
- Positioning
- Central Ray (CR)
- IR / Detector
- SID
- Collimation

## Image Evaluation Criteria
- Key anatomy that must be demonstrated.
- Correct positioning indicators.
- Acceptable visualization standards.

## Common Pathologies Demonstrated
- Relevant fractures, dislocations, degenerative changes, and soft tissue findings.

## Common Positioning Errors
- Frequent mistakes and how they affect image quality.

## Radiographic Tips
- Practical positioning tips.
- Patient comfort and immobilization advice.
- Breathing instructions if relevant.

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
  // lightweight cleanup to prevent unbounded growth
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

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = buildPrompt(module, projectionName);

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    });

    const markdown = completion.choices?.[0]?.message?.content?.trim();
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
