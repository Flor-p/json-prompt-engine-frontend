export function transformSora(data: Record<string, any>): string {
  const parts: string[] = [];

  if (data.subject) parts.push(data.subject);
  if (data.style) parts.push(`${data.style} style`);
  if (data.mood) parts.push(`${data.mood} atmosphere`);
  if (data.camera_motion) parts.push(`with ${data.camera_motion} camera movement`);

  const prompt = parts.filter(Boolean).join(', ');

  const settings: string[] = [];

  if (data.duration) settings.push(data.duration);
  if (data.aspect_ratio) settings.push(data.aspect_ratio);
  if (data.loop) settings.push('loop');
  if (data.seed) settings.push(`seed ${data.seed}`);

  const settingsLine = settings.length > 0
    ? `[Settings: ${settings.join(' · ')}]`
    : '';

  const output = [prompt, settingsLine].filter(Boolean).join('\n');

  return output || 'Empty prompt';
}