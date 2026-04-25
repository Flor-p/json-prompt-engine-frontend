'use client';

import { Copy, Download, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OutputDisplayProps {
  output: string;
  jsonData: Record<string, any>;
  modelName: string;
  compact?: boolean;
}

export function OutputDisplay({ output, jsonData, modelName, compact = false }: OutputDisplayProps) {
  const hasOutput = output && output !== 'Empty prompt';

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
    </div>
  );
}
