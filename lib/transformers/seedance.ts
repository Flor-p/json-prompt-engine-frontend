export function transformSeedance(data: Record<string, any>): string {
  const parts: string[] = [];

  if (data.subject) parts.push(data.subject);
  if (data.action) parts.push(data.action);
  if (data.camera) parts.push(data.camera);
  if (data.scene) parts.push(data.scene);
  if (data.style) parts.push(data.style);

  const prompt = parts.filter(Boolean).join(', ');

  const settings: string[] = [];
  if (data.duration) settings.push(data.duration);
  if (data.aspect_ratio) settings.push(data.aspect_ratio);

  const settingsLine = settings.length > 0
    ? `[Settings: ${settings.join(' · ')}]`
    : '';

  const referenceLine = data.reference_image
    ? `Reference: ${data.reference_image}`
    : '';

  const negativeLine = data.negative_prompt
    ? `Negative: ${data.negative_prompt}`
    : '';

  const output = [prompt, settingsLine, referenceLine, negativeLine]
    .filter(Boolean)
    .join('\n');

  return output || 'Empty prompt';
}
