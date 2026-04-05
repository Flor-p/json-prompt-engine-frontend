export function transformGemini(data: Record<string, any>): string {
  const promptParts: string[] = [];

  if (data.subject) {
    promptParts.push(data.subject);
  }

  if (data.style) {
    promptParts.push(`in ${data.style} style`);
  }

  if (data.mood) {
    promptParts.push(`with ${data.mood} mood`);
  }

  if (data.lighting) {
    promptParts.push(`${data.lighting} lighting`);
  }

  const naturalPrompt = promptParts.filter(Boolean).join(', ');

  const apiParams: Record<string, any> = {};

  if (data.aspect_ratio) {
    apiParams.aspectRatio = data.aspect_ratio;
  }

  if (data.person_generation) {
    apiParams.personGeneration = data.person_generation;
  }

  if (data.safety_filter_level) {
    apiParams.safetyFilterLevel = data.safety_filter_level;
  }

  if (data.language && data.language !== 'auto') {
    apiParams.language = data.language;
  }

  if (data.seed) {
    apiParams.seed = data.seed;
  }

  const output: string[] = [];

  if (naturalPrompt) {
    output.push('Natural Language Prompt:');
    output.push(naturalPrompt);
    output.push('');
  }

  if (Object.keys(apiParams).length > 0) {
    output.push('API Parameters:');
    output.push(JSON.stringify(apiParams, null, 2));
  }

  return output.join('\n') || 'Empty prompt';
}
