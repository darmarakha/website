// ZAI SDK singleton — promise-based pattern avoids race conditions
import type ZAIType from 'z-ai-web-dev-sdk';

let zaiPromise: Promise<ZAIType> | null = null;

export async function getZAI(): Promise<ZAIType> {
  if (!zaiPromise) {
    zaiPromise = import('z-ai-web-dev-sdk').then(async (mod) => {
      const instance = await mod.default.create();
      return instance;
    });
  }
  return zaiPromise;
}
