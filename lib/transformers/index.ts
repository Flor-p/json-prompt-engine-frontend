import { transformMidjourney } from './midjourney';
import { transformStableDiffusion } from './stableDiffusion';
import { transformGemini } from './gemini';
import { transformRunwayGen4 } from './runwayGen4';
import { transformLumaDreamMachine } from './lumaDreamMachine';
import { transformSeedance } from './seedance';
import { transformKling } from './kling';

type TransformerFunction = (data: Record<string, any>) => string;

const transformers: Record<string, TransformerFunction> = {
  'midjourney': transformMidjourney,
  'stable-diffusion': transformStableDiffusion,
  'gemini-2.5-pro': transformGemini,
  'gemini-2.5-flash': transformGemini,
  'runway-gen4': transformRunwayGen4,
  'luma-dream-machine': transformLumaDreamMachine,
  'seedance-2': transformSeedance,
  'kling-3': transformKling,
};

export function getTransformer(modelId: string): TransformerFunction {
  return transformers[modelId] || ((data) => JSON.stringify(data, null, 2));
}

export function transformData(modelId: string, data: Record<string, any>): string {
  const transformer = getTransformer(modelId);
  return transformer(data);
}
