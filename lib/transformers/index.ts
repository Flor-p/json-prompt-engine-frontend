import { transformMidjourney } from './midjourney';
import { transformStableDiffusion } from './stableDiffusion';
import { transformGemini } from './gemini';
import { transformSora } from './sora';
import { transformRunwayGen4 } from './runwayGen4';
import { transformLumaDreamMachine } from './lumaDreamMachine';

type TransformerFunction = (data: Record<string, any>) => string;

const transformers: Record<string, TransformerFunction> = {
  'midjourney': transformMidjourney,
  'stable-diffusion': transformStableDiffusion,
  'gemini-2.5-pro': transformGemini,
  'gemini-2.5-flash': transformGemini,
  'sora': transformSora,
  'runway-gen4': transformRunwayGen4,
  'luma-dream-machine': transformLumaDreamMachine,
};

export function getTransformer(modelId: string): TransformerFunction {
  return transformers[modelId] || ((data) => JSON.stringify(data, null, 2));
}

export function transformData(modelId: string, data: Record<string, any>): string {
  const transformer = getTransformer(modelId);
  return transformer(data);
}
