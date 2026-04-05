export function transformLumaDreamMachine(data: Record<string, any>): string {
  const parts: string[] = [];

  if (data.subject) parts.push(data.subject);
  if (data.style) parts.push(`${data.style} style`);
  if (data.mood) parts.push(`${data.mood} atmosphere`);
  if (data.camera_motion) parts.push(`with ${data.camera_motion} camera movement`);

  const prompt = parts.filter(Boolean).join(', ');

  const settings: string[] = [];

  if (data.aspect_ratio) settings.push(data.aspect_ratio);
  if (data.loop) settings.push('loop');
  if (data.enhance_prompt) settings.push('enhance prompt');

  const settingsLine = settings.length > 0
    ? `[Settings: ${settings.join(' · ')}]`
    : '';

  // Keyframes en sección separada — son referencias visuales, no settings
  const keyframes: string[] = [];
  if (data.keyframe_start) keyframes.push(`Start: ${data.keyframe_start}`);
  if (data.keyframe_end) keyframes.push(`End: ${data.keyframe_end}`);

  const keyframeLine = keyframes.length > 0
    ? `[Keyframes: ${keyframes.join(' → ')}]`
    : '';

  return [prompt, settingsLine, keyframeLine]
    .filter(Boolean)
    .join('\n') || 'Empty prompt';
}