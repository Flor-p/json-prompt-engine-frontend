export function transformKling(data: Record<string, any>): string {
  const parts: string[] = [];

  if (data.subject) parts.push(data.subject);
  if (data.action) parts.push(data.action);
  if (data.camera) parts.push(data.camera);
  if (data.scene) parts.push(data.scene);
  if (data.style) parts.push(data.style);

  const prompt = parts.filter(Boolean).join(', ');

  const settings: string[] = [];
  if (data.mode) settings.push(data.mode);
  if (data.duration) settings.push(data.duration);
  if (data.aspect_ratio) settings.push(data.aspect_ratio);
  if (data.resolution) settings.push(data.resolution);
  if (data.cfg_scale !== undefined && data.cfg_scale !== '') {
    settings.push(`cfg: ${data.cfg_scale}`);
  }

  const settingsLine = settings.length > 0
    ? `[Settings: ${settings.join(' · ')}]`
    : '';

  const negativeLine = data.negative_prompt
    ? `Negative: ${data.negative_prompt}`
    : '';

  const output = [prompt, settingsLine, negativeLine]
    .filter(Boolean)
    .join('\n');

  return output || 'Empty prompt';
}
