import { NextRequest, NextResponse } from 'next/server';
import { Field, ModelSchema } from '@/config/modelSchemas';

const ANTHROPIC_TIMEOUT_MS = 20_000;
const MODEL = 'claude-haiku-4-5-20251001';
const TOOL_NAME = 'fill_prompt_fields';

const SYSTEM_PROMPT = `You are a senior commercial director and prompt engineer inside JSON Prompt Engine. You turn a short brief into the fields of an AI image or video prompt by calling the "${TOOL_NAME}" tool.

LANGUAGE — non-negotiable:
- Every field value is written in ENGLISH, even when the brief is in Spanish.
- Only exception: "dialogue". Spoken lines use the brief's language (Spanish brief → Spanish lines) and "dialogue_language" is set to match.
- "explanation" uses the brief's language.

DIRECTION — a single short clip, premium commercial quality:
- DECIDE. Never write alternatives: no "or", no "and/or", no slashes between options. One place, one look, one music style.
- ONE action beat (two at most). No sequences like enters → sits → is served → tastes.
- ONE camera movement. Never a list of shots.
- Keep every detail the brief states. Invent only what the brief leaves open.
- Do not repeat information across fields.`;

/** Per-field direction, keyed by field name. Applied on top of the schema description. */
const FIELD_RULES: Record<string, string> = {
  subject: 'English. Who or what is on screen, nothing else. Max 15 words.',
  action: 'English. ONE action beat, present tense. Max 15 words. No sequence of events.',
  camera: 'English. Exactly one shot: shot size + one movement + angle. Max 12 words. Example format: "slow push-in, medium close-up, eye level".',
  scene: 'English. One specific location + atmosphere + time of day. Max 20 words. No alternatives.',
  lighting: 'English. Light source, quality and color. Max 15 words.',
  style: 'English. Look, film stock, color grade. Max 15 words.',
  ambience: 'English. Environmental sound only, near to far. NEVER music. Max 15 words.',
  sfx: 'English. Two or three sounds tied to their source. NEVER repeat a sound already in ambience. Max 15 words.',
  music: 'English. One style, instruments, tempo, energy. Max 15 words.',
  dialogue:
    'Brief language. Optional. EXACTLY ONE line, spoken by the subject who is on screen — never by an off-screen character. Format: "Speaker, delivery: spoken words". No quotation marks. Max 8 spoken words.',
  ending: 'English. ONE visual beat that closes the clip. Max 12 words.',
  on_screen_text: 'Optional. 2–3 words. Choose words that are spelled without accents or special characters (e.g., BUENOS AIRES, not CAFÉ PORTEÑO). Empty string if the brief does not need a slogan.',
  constraints: 'English. Always starts with "subtitles, captions, watermark", plus anything specific to avoid.',
};

function fieldToJsonSchema(field: Field): Record<string, unknown> {
  const description = [FIELD_RULES[field.name], field.description].filter(Boolean).join(' ');

  switch (field.type) {
    case 'select':
      return { type: 'string', enum: field.options?.map((o) => o.value) ?? [], description };
    case 'checkbox':
      return { type: 'boolean', description };
    case 'slider':
    case 'number':
      return {
        type: 'number',
        ...(field.min !== undefined ? { minimum: field.min } : {}),
        ...(field.max !== undefined ? { maximum: field.max } : {}),
        description,
      };
    default:
      return { type: 'string', description };
  }
}

/**
 * Video: technical settings (duration, ratio, resolution, audio) are set in the
 * platform UI, so the assistant only writes creative fields. Image: all fields.
 */
const isAssistantField = (field: Field, tab: ModelSchema['tab']): boolean =>
  tab === 'image' || field.type === 'text' || field.type === 'textarea' || field.name === 'dialogue_language';

function buildTool(schema: ModelSchema) {
  const creative = schema.fields.filter((f) => isAssistantField(f, schema.tab));
  const properties: Record<string, unknown> = {
    explanation: {
      type: 'string',
      description: 'One short sentence in the language of the brief describing the creative idea.',
    },
  };
  for (const field of creative) properties[field.name] = fieldToJsonSchema(field);

  return {
    name: TOOL_NAME,
    description: `Fill the prompt fields for ${schema.name} (${schema.tab}).`,
    input_schema: {
      type: 'object',
      properties,
      required: ['explanation', ...creative.filter((f) => ['subject', 'action', 'camera', 'scene'].includes(f.name)).map((f) => f.name)],
    },
  };
}

function sanitizeFields(raw: Record<string, unknown>, schema: ModelSchema): Record<string, any> {
  const allowed = new Map(schema.fields.map((f) => [f.name, f]));
  const clean: Record<string, any> = {};

  for (const [key, value] of Object.entries(raw)) {
    const field = allowed.get(key);
    if (!field || value === undefined || value === null) continue;

    if (field.type === 'select') {
      if (field.options?.some((o) => o.value === value)) clean[key] = value;
      continue;
    }
    if (field.type === 'checkbox') {
      clean[key] = Boolean(value);
      continue;
    }
    if (field.type === 'slider' || field.type === 'number') {
      const n = Number(value);
      if (Number.isNaN(n)) continue;
      clean[key] = Math.min(field.max ?? Infinity, Math.max(field.min ?? -Infinity, n));
      continue;
    }
    let text = typeof value === 'string' ? value.trim() : String(value);
    if (key === 'dialogue') {
      // Hard limit: one spoken line. The clip is short and only on-screen speakers lip-sync reliably.
      text = text
        .replace(/\\n/g, '\n')
        .split(/\n|;|(?<=[.!?…'"”’])\s+(?=[A-ZÁÉÍÓÚÑ][^.:!?]{0,50}:)/)[0]
        .trim();
    }
    clean[key] = text;
  }
  return clean;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI assistant is not configured' }, { status: 500 });
  }

  let body: { message?: string; activeModel?: string; modelSchema?: ModelSchema };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { message, modelSchema } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 });
  }
  if (!modelSchema?.fields?.length) {
    return NextResponse.json({ error: 'No model schema provided' }, { status: 400 });
  }

  const tool = buildTool(modelSchema);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ANTHROPIC_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        tools: [tool],
        tool_choice: { type: 'tool', name: TOOL_NAME },
        messages: [
          {
            role: 'user',
            content: `Brief: ${message.trim()}\n\nTarget model: ${modelSchema.name}. Field values in English (dialogue in the brief's language). One action, one camera move, no alternatives.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      // Never forward raw provider errors to the client (screen may be projected).
      console.error('Anthropic API error', response.status, await response.text());
      return NextResponse.json(
        { error: `AI service error (${response.status}). Use the fields manually.` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const toolUse = (data.content ?? []).find(
      (block: { type: string; name?: string }) => block.type === 'tool_use' && block.name === TOOL_NAME,
    ) as { input?: Record<string, unknown> } | undefined;

    if (!toolUse?.input) {
      return NextResponse.json({ error: 'AI returned no fields. Try again or use the fields manually.' }, { status: 502 });
    }

    const { explanation, ...fields } = toolUse.input;
    return NextResponse.json({
      explanation: typeof explanation === 'string' && explanation.trim() ? explanation : 'Done.',
      fields: sanitizeFields(fields, modelSchema),
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      {
        error: aborted
          ? 'AI assistant timed out. Use the fields manually.'
          : 'AI assistant unavailable. Use the fields manually.',
      },
      { status: aborted ? 504 : 500 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
