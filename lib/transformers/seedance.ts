import { buildVideoPrompt } from './videoPrompt';

/**
 * Seedance 2.0 / 2.5 (ByteDance).
 * Recommended order: subject + action → scene → lighting → style → camera → sound.
 * Native audio (ambience, SFX, lip-synced dialogue) is generated with the picture.
 */
export function transformSeedance(data: Record<string, any>): string {
  return buildVideoPrompt(data, {
    visualOrder: ['subject_action', 'scene', 'lighting', 'style', 'camera'],
    dialogueFormat: 'quoted',
    audioEnabled: data.generate_audio !== false,
  });
}
