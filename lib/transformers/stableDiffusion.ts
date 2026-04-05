export function transformStableDiffusion(data: Record<string, any>): string {
  // Positive prompt con LoRA inline
  let positivePrompt = data.positive_prompt || '';
  if (data.lora) {
    positivePrompt = positivePrompt
      ? `${positivePrompt} ${data.lora}`
      : data.lora;
  }

  if (!positivePrompt) return 'Empty prompt';

  const lines: string[] = [];

  // Línea 1 — positive prompt
  lines.push(positivePrompt);

  // Línea 2 — negative prompt (con prefijo estándar A1111)
  if (data.negative_prompt) {
    lines.push(`Negative prompt: ${data.negative_prompt}`);
  }

  // Línea 3 — parámetros en formato A1111 estándar
  const params: string[] = [];

  if (data.steps !== undefined) params.push(`Steps: ${data.steps}`);
  if (data.sampler) params.push(`Sampler: ${data.sampler}`);
  if (data.cfg_scale !== undefined) params.push(`CFG scale: ${data.cfg_scale}`);
  if (data.seed !== undefined && data.seed !== -1) params.push(`Seed: ${data.seed}`);
  if (data.width && data.height) params.push(`Size: ${data.width}x${data.height}`);
  if (data.checkpoint) params.push(`Model: ${data.checkpoint}`);

  if (params.length > 0) {
    lines.push(params.join(', '));
  }

  return lines.join('\n');
}