import { buildVideoPrompt } from './videoPrompt';

/**
 * Veo 3.1 (Google). Fixed 8s clips, audio always on.
 * Formula: subject + motion → camera → environment → audio.
 * Dialogue uses "speaker, delivery: line" without quotes (quotes may render as on-screen text).
 */
export function transformVeo(data: Record<string, any>): string {
  return buildVideoPrompt(data, {
    visualOrder: ['subject_action', 'camera', 'scene', 'lighting', 'style'],
    dialogueFormat: 'colon',
    audioEnabled: true,
  });
}
