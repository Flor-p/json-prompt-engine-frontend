import { NextRequest, NextResponse } from 'next/server';
import { Field, ModelSchema } from '@/config/modelSchemas';

const ANTHROPIC_TIMEOUT_MS = 20_000;
const MODEL = 'claude-haiku-4-5-20251001';
const TOOL_NAME = 'fill_prompt_fields';

const SYSTEM_PROMPT = `You are a senior commercial director and prompt engineer inside JSON Prompt Engine. You turn a short brief into the fields of an AI image or video prompt by calling the "${TOOL_NAME}" tool.

LANGUAGE — non-negotiable:
- Every field value is written in ENGLISH, even when the brief is in Spanish.
- Only exception: "dialogue". Spoken lines use the brief's language (Spanish brief → Spanish lines) and "dialogue_language" is set to match.
- The spoken words in "dialogue" are WRITTEN in that language (Spanish brief → Spanish words, e.g. "Señores, esto no se negocia"). Never English words in a Spanish line.
- "explanation" uses the brief's language.

CREATIVE CONCEPT — do this FIRST, like a top agency creative director:
- Find ONE surprising twist that turns the brief into a memorable 15-second spot: humor, emotion or an unexpected angle the audience gets instantly. Never the obvious, literal version.
- Hyperbole or fantasy in the brief IS the premise: dramatize it with full commitment ("the most important meeting in the world" → staged with the gravity of a world summit), never tone it down.
- Clear arc: hook → build → payoff. The LAST shot is the punchline or the emotional peak.
- If the brief names a product, brand or service, it is the hero of the last shot.
- Write the twist in "explanation", in the brief's language, starting with "IDEA: " (max 25 words).

DIRECTION — a single short clip, premium commercial quality:
- DECIDE. Never write alternatives: no "or", no "and/or", no slashes between options. One place, one look, one music style.
- ONE action beat (two at most). No sequences like enters → sits → is served → tastes.
- ONE camera movement per shot. Never list several shots in one field (multi-shot spots use "shot_list" only).
- Keep every detail the brief states. Invent only what the brief leaves open.
- Respect the brief's facts and intended tone. Never add destruction, violence or danger it does not ask for ("visita" = visits, calmly). Exaggeration and fantasy in the brief are amplified, never softened.
- MODERATION-SAFE: no violence, weapons, blood, gore, nudity or drugs, and no real people (presidents, celebrities, athletes) by name or likeness — use fictional archetypes ("world leaders in dark suits").
- PROTECTED CHARACTERS: video models block copyrighted characters (e.g., Godzilla, Mickey Mouse, Spider-Man, Pikachu). Never write their names. Replace each with an ORIGINAL character of the same archetype, described in your own words (e.g., Godzilla → "a colossal reptilian monster"), without copying its signature design. Mention the swap in "explanation".
- Real places and landmarks (e.g., the Obelisco) stay as written.
- Everything must be consistent: lighting matches the time of day in "scene"; "constraints" never contradicts the premise or other fields (never "no exaggeration" for a fantastical premise, never "no music" when music is set).
- LOCAL OBJECTS: video models do not know Argentine objects. Never write just their name; describe the object AND how it is physically used, in English. Examples: mate → "a hollow gourd with a metal straw (bombilla), sipped through the straw, never drunk like a cup"; termo → "a tall thermos pouring hot water into the gourd"; asado → "meat grilling on an open parrilla grill over embers"; colectivo → "a colorful Buenos Aires city bus"; dulce de leche → "thick caramel spread"; alfajor → "a round cookie sandwich filled with caramel".
- NON-HUMAN CHARACTERS (animals, creatures, dragons, monsters, living objects): they never do fine hand work (grabbing, pouring, holding tools). They act with snout, mouth, head, paws on the ground or the whole body, or the shot shows the result already done. Keep their anatomy natural: no human hands, no extra limbs.
- OBJECT CONTINUITY: every object keeps one consistent state for the whole clip (where it is, who holds it). Never make an object appear, disappear or "enter the frame" if it is already in the scene. The ending continues the action; it never re-introduces something already present.
- Do not repeat information across fields.`;

/** Per-field direction, keyed by field name. Applied on top of the schema description. */
const FIELD_RULES: Record<string, string> = {
  subject: 'English. Who or what is on screen, nothing else. Max 15 words.',
  action: 'English. ONE action beat, present tense. Max 15 words. No sequence of events. If the character is an animal or creature: it NEVER holds, grabs, pours or uses paws like hands; it acts with snout, mouth, head or body, or the result is shown already done.',
  camera: 'English. Exactly one shot: shot size + one movement + angle. Max 12 words. Example format: "slow push-in, medium close-up, eye level".',
  scene: 'English. One specific location + atmosphere + time of day. Max 20 words. No alternatives.',
  lighting: 'English. Light source, quality and color, consistent with the time of day in scene. Max 15 words.',
  style: 'English. Look, film stock, color grade. Max 15 words.',
  ambience: 'English. Environmental sound only, near to far. NEVER music. Max 15 words.',
  sfx: 'English. Two or three sounds tied to their source, including any animal, creature or machine vocal sounds (roars, growls, purrs). NEVER repeat a sound already in ambience. Max 15 words.',
  music: 'English. One style, instruments, tempo, energy. Max 15 words.',
  dialogue:
    'Spoken words WRITTEN in the brief\'s language (Spanish brief → Spanish words). HUMAN SPEECH ONLY — leave it blank ("") when no person on screen speaks. Animals, creatures and machines never go here (their sounds go in sfx). At most ONE line, spoken by a person who is on screen. Format: "Speaker, delivery: spoken words". No quotation marks. Max 8 spoken words.',
  ending: 'English. ONE visual beat that closes the clip. Max 12 words.',
  shot_list:
    'English. ONLY when the request says MULTI-SHOT: exactly the requested number of lines, one per shot, separated by newlines. Each line: "<shot size + one camera move>, <one action>". No "Shot 1" prefix, no timecodes. Max 20 words per line. If the character is an animal or creature: it NEVER holds, grabs, pours or uses paws like hands; it acts with snout, mouth, head or body, or the result is shown already done. Otherwise leave it blank ("").',
  on_screen_text:
    'Leave it BLANK ("") unless the brief explicitly asks for a slogan, tagline, brand name, title or text on screen. Never turn an adjective or idea from the brief into on-screen text. If asked: 2–3 words, prefer words without accents or special characters.',
  constraints: 'English. Always starts with "subtitles, captions, watermark", plus anything specific to avoid. Never contradicts the premise or other fields.',
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
      description:
        'Starts with "IDEA: " — the creative twist in one punchy line, in the language of the brief (max 25 words). Mention any character swap after it.',
    },
  };
  for (const field of creative) properties[field.name] = fieldToJsonSchema(field);

  return {
    name: TOOL_NAME,
    description: `Fill the prompt fields for ${schema.name} (${schema.tab}).`,
    input_schema: {
      type: 'object',
      properties,
      // Sound is part of what judges evaluate: video takes must always come with ambience, effects and music.
      required: [
        'explanation',
        ...creative
          .filter((f) => ['subject', 'action', 'camera', 'scene', 'ambience', 'sfx', 'music'].includes(f.name))
          .map((f) => f.name),
      ],
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
    // Models sometimes write the placeholder itself ("Empty string") — it would render on screen.
    if (/^[\s"'“”]*$/.test(text)) text = '';
    if (/^[\s"'“”(]*(empty( string)?|blank|none|n\/?a|null|nil|vac[ií]o|ninguno|sin texto|no text|-+|—)[\s"'“”).]*$/i.test(text)) text = '';
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

/** Creative fields of take A, so take B can deliberately differ from them. */
const VARIATION_KEYS = ['subject', 'action', 'camera', 'scene', 'lighting', 'style', 'music', 'ending', 'shot_list'];

export interface ClipSettings {
  shots?: string | number;
  duration?: string;
}

/** Multi-shot instructions, only for models whose schema has a shot list. */
function multishotInstructions(schema: ModelSchema, settings?: ClipSettings): string {
  if (!schema.fields.some((f) => f.name === 'shot_list')) return '';
  const shots = Math.min(3, Math.max(1, parseInt(String(settings?.shots ?? '1'), 10) || 1));
  const seconds = parseInt(String(settings?.duration ?? ''), 10) || 15;
  if (shots < 2) return '\n\nSINGLE SHOT: leave "shot_list" blank ("").';
  return `

MULTI-SHOT SPOT: ${shots} shots in one ${seconds}-second clip (about ${Math.round(seconds / shots)} s each).
- Fill "shot_list" with exactly ${shots} lines, one per shot.
- Build a mini story arc: shot 1 hooks and sets the world, ${shots === 3 ? 'shot 2 develops the action, shot 3' : 'shot 2'} is the payoff (the emotion, product or punchline the brief is about).
- Same subject, place and look across all shots: continuity matters.
- Each shot: one shot size + one camera move + one action. Vary shot sizes between shots (wide → medium → close-up, or similar).
- "camera" and "action" describe shot 1 only. Leave "ending" blank ("") (the last shot is the ending).
- Sound and music are written once for the whole clip.`;
}

/** Spanish + English animal/creature words, to detect them in the user's brief. */
const BRIEF_NON_HUMAN =
  /\b(perr[oa]s?|cachorr[oa]s?|gat[oa]s?|pájar[oa]s?|pajar[oa]s?|palomas?|loros?|búhos?|patos?|gallinas?|gallos?|pingüinos?|caballos?|vacas?|toros?|cerdos?|chanchos?|ovejas?|cabras?|llamas?|zorr[oa]s?|lob[oa]s?|osos?|leones?|tigres?|elefantes?|jirafas?|conejos?|ratones?|ratas?|ranas?|tortugas?|ballenas?|delfines?|peces|pez|tiburones?|pulpos?|dragones?|dragón|dinosaurios?|monstruos?|criaturas?|bestias?|unicornios?|animales?|dogs?|cats?|birds?|pigeons?|horses?|dragons?|monsters?|creatures?|animals?)\b/i;

function buildUserMessage(
  brief: string,
  schema: ModelSchema,
  variationOf?: Record<string, unknown>,
  settings?: ClipSettings,
): string {
  const animalNote = BRIEF_NON_HUMAN.test(brief)
    ? '\n\nANIMAL / CREATURE IN THIS BRIEF: it must never hold, grab, pour or use its paws like hands. Show its talent with the snout, mouth, head or body, or show the result already done (e.g., it sits proudly next to the finished work). Keep natural anatomy.'
    : '';
  const base = `Brief: ${brief}\n\nTarget model: ${schema.name}. First find the twist (IDEA). Field values in English (dialogue written in the brief's language). No alternatives.${multishotInstructions(schema, settings)}${animalNote}`;
  if (!variationOf || typeof variationOf !== 'object') return base;

  const takeA = Object.fromEntries(
    Object.entries(variationOf).filter(([k, v]) => VARIATION_KEYS.includes(k) && typeof v === 'string' && v.trim()),
  );
  return `${base}

This is TAKE B. Take A already exists:
${JSON.stringify(takeA, null, 2)}

Write a clearly different take of the SAME brief:
- Keep the brief, the product and the tone. Keep every detail the brief states.
- Change the camera movements and shot sizes (in every shot, if it is a multi-shot spot).
- Change the lighting treatment (and time of day, unless the brief fixes it).
- Change the music style and the closing shot.
- It is a COMPLETE take: write ambience, sound effects and music again (and a dialogue line if the brief calls for one).
${schema.fields.some((f) => f.name === 'shot_list') ? '- Keep the same number of shots as take A.' : '- This model takes ONE single shot: ignore take A\'s shot list and write one continuous shot.'}`;
}

/** True when the brief explicitly asks for text on screen (slogan, brand, title, quoted words). */
function briefAsksForText(brief: string): boolean {
  const b = brief.toLowerCase();
  if (/["“”«»]/.test(brief)) return true;
  return /\b(e?slogan|tagline|claim|lema|frase|texto|text|t[ií]tulo|title|marca|brand|logo|cartel|sign|leyenda|caption|copy)\b/.test(b);
}

/**
 * Hard fallback for protected characters: video models (Seedance especially) reject them in moderation.
 * Each name is swapped for an original archetype so a generation is never lost to a block.
 */
const PROTECTED_CHARACTERS: Array<[RegExp, string]> = [
  [/\bgodzilla\b/gi, 'a colossal reptilian monster'],
  [/\bking kong\b/gi, 'a giant ape'],
  [/\bmickey( mouse)?\b/gi, 'a cheerful cartoon mouse'],
  [/\bminnie( mouse)?\b/gi, 'a cheerful cartoon mouse'],
  [/\bspider-?man\b/gi, 'a masked acrobatic superhero'],
  [/\bbatman\b/gi, 'a caped vigilante in a dark suit'],
  [/\bsuperman\b/gi, 'a flying caped superhero'],
  [/\biron ?man\b/gi, 'a superhero in a high-tech metal suit'],
  [/\bhulk\b/gi, 'a giant green-skinned strongman'],
  [/\bpikachu\b/gi, 'a small yellow electric creature'],
  [/\bsuper mario\b/gi, 'a mustached plumber in overalls'],
  [/\bshrek\b/gi, 'a friendly green ogre'],
  [/\bhello kitty\b/gi, 'a cute white cartoon cat'],
  [/\bdarth vader\b/gi, 'a masked villain in black armor'],
  [/\byoda\b/gi, 'a tiny wise green elder'],
  [/\bhomer simpson\b/gi, 'a bald cartoon dad'],
  [/\bbarbie\b/gi, 'a glamorous fashion doll'],
];

function replaceProtected(text: string): string {
  return PROTECTED_CHARACTERS.reduce((acc, [re, generic]) => acc.replace(re, generic), text);
}

/** Animals and creatures: video models tend to morph their paws into human hands. */
const NON_HUMAN =
  /\b(dogs?|pupp(?:y|ies)|cats?|kittens?|birds?|pigeons?|doves?|parrots?|owls?|ducks?|chickens?|hens?|roosters?|penguins?|horses?|cows?|bulls?|pigs?|sheep|goats?|llamas?|foxes|fox|wolf|wolves|bears?|lions?|tigers?|elephants?|giraffes?|rabbits?|bunn(?:y|ies)|mice|mouse|rats?|squirrels?|frogs?|turtles?|tortoises?|whales?|dolphins?|fish|sharks?|octop(?:us|i)|crabs?|dragons?|dinosaurs?|monsters?|creatures?|beasts?|unicorns?|kaiju|reptil\w*|animals?)\b/i;

const ANATOMY_GUARD = 'human hands on animals or creatures, extra limbs, morphing anatomy';

/** Soft "realism" words that water down an exaggerated or fantastical premise. */
const SOFTENERS = /exaggerat|grounded|realistic|realism|subtle|natural|understated|keep it|minimal|calm|toned?[ -]down|over-the-top|dramatic|fantas|surreal/i;

/**
 * "Avoid" keeps only a comma list of things to avoid: no extra sentences, no
 * "keep it grounded" rules that contradict the premise, no double negatives.
 */
function cleanConstraints(raw: string): string {
  const firstSentence = raw.split(/(?<=[a-z0-9)])\.\s+|;|\n/i)[0] ?? '';
  const items = firstSentence
    .split(',')
    .map((i) => i.trim().replace(/^(no|avoid|never)\s+/i, '').replace(/[.\s]+$/, ''))
    .filter((i) => i && !SOFTENERS.test(i));
  const base = ['subtitles', 'captions', 'watermark'];
  const extra = items.filter((i) => !base.includes(i.toLowerCase()));
  return [...base, ...extra].slice(0, 9).join(', ');
}

/** Mate is sipped through the bombilla — never raised to the lips like a cup. */
function fixMateSip(text: string): string {
  return text
    .replace(/\b(raises|lifts|brings|tilts)\s+(the\s+)?(mate|gourd)(\s+gourd)?\s+to\s+(his|her|their)?\s*(lips|mouth)\b/gi, 'sips the mate through the metal straw')
    .replace(/\bdrinks\s+(from\s+)?(the\s+)?(mate|gourd)\b/gi, 'sips the mate through the metal straw');
}

/** Appends the anatomy guard to "constraints" when any visual field features a non-human character. */
function addAnatomyGuard(fields: Record<string, any>): void {
  const visual = ['subject', 'action', 'scene', 'shot_list', 'ending']
    .map((k) => (typeof fields[k] === 'string' ? fields[k] : ''))
    .join(' ');
  if (!NON_HUMAN.test(visual)) return;
  const current = typeof fields.constraints === 'string' ? fields.constraints.trim() : '';
  if (current.toLowerCase().includes('human hands')) return;
  fields.constraints = current ? `${current.replace(/[.;,\s]+$/, '')}, ${ANATOMY_GUARD}` : ANATOMY_GUARD;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI assistant is not configured' }, { status: 500 });
  }

  let body: {
    message?: string;
    activeModel?: string;
    modelSchema?: ModelSchema;
    /** Fields of take A. When present, the assistant writes an alternative take B of the same brief. */
    variationOf?: Record<string, unknown>;
    /** Technical settings the prompt must be written for (shot count, duration). */
    settings?: ClipSettings;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { message, modelSchema, variationOf, settings } = body;
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
            content: buildUserMessage(message.trim(), modelSchema, variationOf, settings),
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
    const clean = sanitizeFields(fields, modelSchema);
    for (const [key, value] of Object.entries(clean)) {
      if (typeof value === 'string' && key !== 'on_screen_text') clean[key] = replaceProtected(value);
    }
    if (modelSchema.tab === 'video') {
      for (const key of ['action', 'shot_list', 'ending']) {
        if (typeof clean[key] === 'string') clean[key] = fixMateSip(clean[key]);
      }
    }
    if (modelSchema.tab === 'video' && modelSchema.fields.some((f) => f.name === 'constraints')) {
      if (typeof clean.constraints === 'string') clean.constraints = cleanConstraints(clean.constraints);
      addAnatomyGuard(clean);
    }
    // Hard guard: no on-screen text unless the brief asks for it (models render any text they get).
    if (modelSchema.fields.some((f) => f.name === 'on_screen_text') && !briefAsksForText(message)) {
      clean.on_screen_text = '';
    }
    return NextResponse.json({
      explanation: typeof explanation === 'string' && explanation.trim() ? explanation : 'Done.',
      fields: clean,
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
