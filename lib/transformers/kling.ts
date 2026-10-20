import { buildVideoPrompt } from './videoPrompt';

/**
 * Kling 3.0 (Kuaishou).
 * The first words set the visual tone, so camera language leads.
 * Native audio is optional (toggle in the platform UI).
 */
export function transformKling(data: Record<string, any>): string {
  return buildVideoPrompt(data, {
    visualOrder: ['camera', 'subject_action', 'scene', 'lighting', 'style'],
    dialogueFormat: 'quoted',
    audioEnabled: data.generate_audio !== false,
  });
}
