export function transformMidjourney(data: Record<string, any>): string {
  const parts: string[] = [];

  if (data.subject) parts.push(data.subject);
  if (data.style) parts.push(data.style);
  if (data.mood) parts.push(data.mood);
  if (data.lighting) parts.push(data.lighting);
  if (data.camera) parts.push(data.camera);

  let prompt = parts.filter(Boolean).join(', ');

  const params: string[] = [];

  if (data.ar) {
    params.push(`--ar ${data.ar}`);
  }

  if (data.v) {
    params.push(`--v ${data.v}`);
  }

  if (data.stylize !== undefined && data.stylize !== 100) {
    params.push(`--stylize ${data.stylize}`);
  }

  if (data.chaos !== undefined && data.chaos > 0) {
    params.push(`--chaos ${data.chaos}`);
  }

  if (data.seed) {
    params.push(`--seed ${data.seed}`);
  }

  if (data.sref) {
    params.push(`--sref ${data.sref}`);
  }

  if (data.negative) {
    params.push(`--no ${data.negative}`);
  }

  if (params.length > 0) {
    prompt += ' ' + params.join(' ');
  }

  return prompt
    ? `/imagine prompt: ${prompt}`
    : `/imagine prompt: [empty]`;
}