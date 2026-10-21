/**
 * Shared builder for video-model prompts with native audio.
 *
 * Output is PROMPT TEXT ONLY — ready to paste into the model's prompt box.
 * Technical settings (duration, aspect ratio, resolution, audio toggle) are
 * set in the platform UI, so they are intentionally NOT written into the prompt.
 */

export type VisualPart = 'camera' | 'subject_action' | 'scene' | 'lighting' | 'style';

export type DialogueFormat =
  /** Seedance / Kling: Dialogue (English): "line" */
  | 'quoted'
  /** Veo 3.1: speaker + delivery + colon + line, no quotes (quotes can render as on-screen text) */
  | 'colon';

export interface VideoPromptOptions {
  /** Order of visual blocks. Each model reads the first tokens with more weight. */
  visualOrder: VisualPart[];
  dialogueFormat: DialogueFormat;
  /** When false, the audio paragraph is omitted entirely. */
  audioEnabled?: boolean;
  /** Model accepts "Shot 1 [0-5s]: ..." multi-shot prompts (Seedance). */
  multishot?: boolean;
}

const str = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : value === undefined || value === null ? '' : String(value).trim();

/** Capitalizes the first letter and guarantees closing punctuation. */
export const sentence = (text: string): string => {
  const t = text.trim();
  if (!t) return '';
  const capped = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?…"”')\]]$/.test(capped) ? capped : `${capped}.`;
};

const stripWrappingQuotes = (text: string): string =>
  text.trim().replace(/^["“'«]+/, '').replace(/["”'»]+$/, '').trim();

/** Removes every straight/curly quote so mismatched pairs can never leak into the prompt. */
const stripAllQuotes = (text: string): string =>
  text
    .replace(/["“”«»]/g, '')
    // single quotes used as quote marks (not apostrophes inside words like "it's")
    .replace(/(^|[\s(])['‘’]/g, '$1')
    .replace(/['‘’](?=[\s.,;:!?)]|$)/g, '')
    .trim();

interface DialogueLine {
  speaker: string;
  spoken: string;
}

/**
 * Splits the dialogue field into lines. One line per speaker, separated by
 * newline or semicolon:  "Barista, warmly: Hola\nCustomer: Gracias"
 */
function parseDialogue(raw: string): DialogueLine[] {
  return raw
    .replace(/\\n/g, "\n")
    // newline / semicolon, or a new “Speaker, delivery:” starting after a sentence end
    .split(/\n|;|(?<=[.!?…'"”’])\s+(?=[A-ZÁÉÍÓÚÑ][^.:!?]{0,50}:)/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const idx = chunk.indexOf(':');
      if (idx > 0 && idx < 60) {
        return {
          // Drop a trailing "says" / "says in Spanish" the user or the assistant may have written.
          speaker: stripAllQuotes(chunk.slice(0, idx)).replace(/,?\s*(says|said|speaks)(\s+in\s+[A-Za-zÀ-ÿ]+)?\s*$/i, ''),
          spoken: stripAllQuotes(chunk.slice(idx + 1)),
        };
      }
      return { speaker: '', spoken: stripAllQuotes(chunk) };
    })
    .filter((l) => l.spoken);
}

function buildDialogue(data: Record<string, any>, format: DialogueFormat): string {
  const lines = parseDialogue(str(data.dialogue));
  if (lines.length === 0) return '';

  if (format === 'colon') {
    // Veo 3.1: "The barista, warmly: Your coffee is ready." — no quotes (they may render as on-screen text).
    return lines
      .map(({ speaker, spoken }) => sentence(`${speaker || 'A voice says'}: ${spoken}`))
      .join(' ');
  }

  // Seedance / Kling: The barista, warmly, says in Spanish: "Tu café está listo."
  const language = str(data.dialogue_language) || 'English';
  return lines
    .map(({ speaker, spoken }) => {
      const who = speaker ? sentence(speaker).replace(/\.$/, '') : 'A voice';
      const end = /[.!?…]$/.test(spoken) ? '' : '.';
      return `${who}${who.includes(',') ? ',' : ''} says in ${language}: "${spoken}${end}"`;
    })
    .join(' ');
}


/** "15s" → 15. Falls back to `fallback` when the value is missing or invalid. */
const parseSeconds = (value: unknown, fallback: number): number => {
  const n = parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** Splits the shot list into clean lines, dropping any "Shot 1:" / "1." prefix the user or assistant wrote. */
const parseShotList = (raw: string): string[] =>
  raw
    .replace(/\\n/g, '\n')
    .split('\n')
    .map((line) =>
      line
        .trim()
        .replace(/^(shot|plano|toma)\s*\d+\s*(\[[^\]]*\])?\s*[:.\-–]\s*/i, '')
        .replace(/^\d+\s*[.)\-–]\s*/, '')
        .trim(),
    )
    .filter(Boolean);

/**
 * Builds "Shot 1 [0-5s]: ..." lines with even, contiguous integer timecodes
 * across the clip duration (Seedance multi-shot syntax).
 */
function buildShots(data: Record<string, any>): string {
  const shots = parseShotList(str(data.shot_list));
  if (shots.length < 2) return '';
  const total = parseSeconds(data.duration, 15);
  const n = shots.length;
  return shots
    .map((shot, i) => {
      const start = Math.round((i * total) / n);
      const end = Math.round(((i + 1) * total) / n);
      return `Shot ${i + 1} [${start}-${end}s]: ${sentence(shot)}`;
    })
    .join('\n');
}

export function buildVideoPrompt(data: Record<string, any>, options: VideoPromptOptions): string {
  const { visualOrder, dialogueFormat, audioEnabled = true, multishot = false } = options;
  const wantsShots = multishot && parseInt(str(data.shots) || '1', 10) > 1;
  const shotBlock = wantsShots ? buildShots(data) : '';

  // ── Visual paragraph ──────────────────────────────────────────────
  const subject = str(data.subject);
  const action = str(data.action);
  // If the action is written as its own sentence, close the subject sentence first.
  const subjectAction =
    subject && action
      ? /^[A-ZÁÉÍÓÚÑ]/.test(action)
        ? `${sentence(subject)} ${action}`
        : `${subject} ${action}`
      : subject || action;
  const visualMap: Record<VisualPart, string> = {
    camera: sentence(str(data.camera)),
    subject_action: sentence(subjectAction),
    scene: sentence(str(data.scene)),
    lighting: sentence(str(data.lighting)),
    style: sentence(str(data.style)),
  };
  // Multi-shot: subject + world first, then the timed shot list (camera and action live in each shot).
  const visual = shotBlock
    ? [
        [visualMap.subject_action ? sentence(str(data.subject)) : '', visualMap.scene, visualMap.lighting, visualMap.style]
          .filter(Boolean)
          .join(' '),
        shotBlock,
      ]
        .filter(Boolean)
        .join('\n')
    : visualOrder.map((part) => visualMap[part]).filter(Boolean).join(' ');

  // ── Closing beat ──────────────────────────────────────────────────
  const closing: string[] = [];
  // In a multi-shot spot the last shot is the payoff, so a separate "Final shot" would contradict it.
  const ending = shotBlock ? '' : str(data.ending);
  if (ending) closing.push(sentence(`Final shot: ${ending}`));
  const onScreen = stripWrappingQuotes(str(data.on_screen_text));
  if (onScreen) {
    closing.push(`The final frame displays the text "${onScreen}" in clean, legible, correctly spelled typography.`);
  }

  // ── Audio paragraph ───────────────────────────────────────────────
  const audio: string[] = [];
  if (audioEnabled) {
    const ambience = str(data.ambience);
    const sfx = str(data.sfx);
    const music = str(data.music);
    if (ambience) audio.push(sentence(`Ambient sound: ${ambience}`));
    if (sfx) audio.push(sentence(`Sound effects: ${sfx}`));
    if (music) audio.push(sentence(`Music: ${music}`));
    const dialogue = buildDialogue(data, dialogueFormat);
    if (dialogue) audio.push(dialogue);
  }

  // ── Constraints ───────────────────────────────────────────────────
  const constraints = str(data.constraints);
  const avoid = constraints ? sentence(`Avoid: ${constraints}`) : '';

  const paragraphs = [
    visual,
    closing.join(' '),
    audio.join(' '),
    avoid,
  ].filter(Boolean);

  return paragraphs.length > 0 ? paragraphs.join('\n\n') : 'Empty prompt';
}
