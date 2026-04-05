export function transformRunwayGen4(data: Record<string, any>): string {
  const parts: string[] = [];

  if (data.subject) parts.push(data.subject);
  if (data.style) parts.push(`${data.style} style`);
  if (data.mood) parts.push(`${data.mood} mood`);
  if (data.camera_motion) parts.push(data.camera_motion);

  const prompt = parts.filter(Boolean).join(', ');

  const settings: string[] = [];

  if (data.duration) settings.push(data.duration);
  if (data.motion_amount !== undefined) settings.push(`motion ${data.motion_amount}/10`);
  if (data.aspect_ratio) settings.push(data.aspect_ratio);
  if (data.seed) settings.push(`seed ${data.seed}`);

  const settingsLine = settings.length > 0
    ? `[Settings: ${settings.join(' · ')}]`
    : '';

  const output = [prompt, settingsLine].filter(Boolean).join('\n');

  return output || 'Empty prompt';
}