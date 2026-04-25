'use client';

import { useState } from 'react';

const N8N_WEBHOOK_URL = 'https://florparamidani.app.n8n.cloud/webhook/midjourney-prompt';

export type MidjourneyStatus = 'idle' | 'pending' | 'completed' | 'failed';

export interface MidjourneyJob {
  job_id: string;
  status: MidjourneyStatus;
}

interface UseMidjourneyGenerateReturn {
  job: MidjourneyJob | null;
  isLoading: boolean;
  error: string | null;
  generateImage: (prompt: string) => Promise<void>;
  reset: () => void;
}

export function useMidjourneyGenerate(): UseMidjourneyGenerateReturn {
  const [job, setJob] = useState<MidjourneyJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setJob(null);

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error(`Webhook error: ${res.status} ${res.statusText}`);

      const text = await res.text();
      let data: Record<string, any> = {};
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          // body is not valid JSON — treat as accepted with no job metadata
        }
      }

      setJob({
        job_id: data.job_id ?? data.id ?? '—',
        status: data.status ?? 'pending',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setJob(null);
    setError(null);
  };

  return { job, isLoading, error, generateImage, reset };
}
