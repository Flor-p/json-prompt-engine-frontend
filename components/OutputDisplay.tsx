'use client';

import { Copy, Download, FileJson, Sparkles, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMidjourneyGenerate } from '@/hooks/useMidjourneyGenerate';

interface OutputDisplayProps {
  output: string;
  jsonData: Record<string, any>;
  modelName: string;
  compact?: boolean;
}

export function OutputDisplay({ output, jsonData, modelName, compact = false }: OutputDisplayProps) {
  const hasOutput = output && output !== 'Empty prompt';
  const isMidjourney = modelName === 'midjourney';
  const { job, isLoading, error, generateImage, reset } = useMidjourneyGenerate();

  const getFilename = (ext: string) => {
    const date = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
    return `${modelName}-${date}.${ext}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const exportAsTxt = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFilename('txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exported as TXT!');
  };

  const exportAsJson = () => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFilename('json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exported as JSON!');
  };

  const handleGenerate = async () => {
    await generateImage(output);
  };

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400',
    completed: 'text-green-400',
    failed: 'text-red-400',
  };

  return (
    <div className="space-y-2 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200">Formatted Output</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
            disabled={!hasOutput}
            className="h-8 text-xs"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          {!compact && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={exportAsTxt}
                disabled={!hasOutput}
                className="h-8 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                TXT
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exportAsJson}
                disabled={!hasOutput}
                className="h-8 text-xs"
              >
                <FileJson className="h-3 w-3 mr-1" />
                JSON
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md p-4 overflow-auto">
        <pre className="font-mono text-sm text-zinc-200 whitespace-pre-wrap">
          {output || 'Output will appear here...'}
        </pre>
      </div>

      {isMidjourney && !compact && (
        <div className="space-y-2 pt-1">
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={!hasOutput || isLoading}
            className="w-full h-9 text-xs bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Sending to Midjourney...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-2" />
                Generate Image
              </>
            )}
          </Button>

          {(job || error) && (
            <div className="relative rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 text-xs font-mono">
              <button
                onClick={reset}
                className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300"
                aria-label="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>

              {error && (
                <p className="text-red-400">Error: {error}</p>
              )}

              {job && (
                <div className="space-y-1">
                  {job.job_id !== '—' && (
                    <p className="text-zinc-400">
                      Job ID: <span className="text-zinc-200">{job.job_id}</span>
                    </p>
                  )}
                  <p className="text-zinc-400">
                    Status:{' '}
                    <span className={statusColors[job.status] ?? 'text-zinc-200'}>
                      {job.status}
                    </span>
                  </p>
                  {job.status === 'pending' && (
                    <p className="text-zinc-500 mt-1">
                      Generando imagen, esto puede tomar unos minutos...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}