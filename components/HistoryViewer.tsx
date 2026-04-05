'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { History, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiGetPrompts, apiDeletePrompt, apiClearPrompts, apiSavePrompt } from '@/lib/api';

export interface HistoryEntry {
  id: string;
  model: string;
  tab: 'image' | 'video';
  data: Record<string, any>;
  output: string;
  created_at: string;
}

export const addToHistory = async (entry: Omit<HistoryEntry, 'id' | 'created_at'>) => {
  try {
    await apiSavePrompt(entry);
  } catch (error) {
    console.error('Failed to save history entry:', error);
  }
};

interface HistoryViewerProps {
  onLoadHistory: (entry: HistoryEntry) => void;
}

export function HistoryViewer({ onLoadHistory }: HistoryViewerProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setLoading(true);
      try {
        const data = await apiGetPrompts();
        setHistory(data);
      } catch (error) {
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearHistory = async () => {
    try {
      await apiClearPrompts();
      setHistory([]);
      toast.success('History cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const handleDeleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiDeletePrompt(id);
      setHistory(history.filter(h => h.id !== id));
      toast.success('Entry deleted');
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const handleLoadEntry = (entry: HistoryEntry) => {
    onLoadHistory(entry);
    setIsOpen(false);
    toast.success('Loaded from history');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-zinc-200">
              Prompt History (Last 20)
            </DialogTitle>
            {history.length > 0 && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleClearHistory}
                className="gap-2"
              >
                <Trash2 className="h-3 w-3" />
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-3 overflow-auto max-h-[60vh]">
          {loading ? (
            <p className="text-sm text-zinc-500 text-center py-8">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">
              No history yet
            </p>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-750 transition-colors cursor-pointer"
                onClick={() => handleLoadEntry(entry)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-zinc-200">
                      {entry.model}
                    </span>
                    <span className="text-xs text-zinc-500 ml-2">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadEntry(entry);
                      }}
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => handleDeleteEntry(entry.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <pre className="text-xs font-mono text-zinc-400 whitespace-pre-wrap line-clamp-3">
                  {entry.output}
                </pre>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}