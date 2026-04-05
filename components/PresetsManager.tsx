'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiGetPresets, apiSavePreset, apiDeletePreset } from '@/lib/api';

interface Preset {
  id: string;
  name: string;
  model: string;
  tab: 'image' | 'video';
  data: Record<string, any>;
  created_at: string;
}

interface PresetsManagerProps {
  currentModel: string;
  currentTab: 'image' | 'video';
  currentData: Record<string, any>;
  onLoadPreset: (data: Record<string, any>) => void;
}

export function PresetsManager({
  currentModel,
  currentTab,
  currentData,
  onLoadPreset,
}: PresetsManagerProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setLoading(true);
      try {
        const data = await apiGetPresets();
        setPresets(data);
      } catch (error) {
        toast.error('Failed to load presets');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    try {
      const newPreset = await apiSavePreset({
        name: presetName.trim(),
        model: currentModel,
        tab: currentTab,
        data: currentData,
      });
      setPresets([...presets, newPreset]);
      setPresetName('');
      toast.success('Preset saved!');
    } catch (error) {
      toast.error('Failed to save preset');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeletePreset(id);
      setPresets(presets.filter(p => p.id !== id));
      toast.success('Preset deleted');
    } catch (error) {
      toast.error('Failed to delete preset');
    }
  };

  const handleLoad = (preset: Preset) => {
    onLoadPreset(preset.data);
    setIsOpen(false);
    toast.success(`Loaded: ${preset.name}`);
  };

  const filteredPresets = presets.filter(
    (p) => p.model === currentModel && p.tab === currentTab
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Presets
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-200">Manage Presets</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name..."
              className="bg-zinc-800 border-zinc-700"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            />
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Current
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-auto">
            {loading ? (
              <p className="text-sm text-zinc-500 text-center py-8">Loading...</p>
            ) : filteredPresets.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">
                No presets for this model yet
              </p>
            ) : (
              filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-750 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-zinc-200">{preset.name}</div>
                    <div className="text-xs text-zinc-500">
                      {new Date(preset.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleLoad(preset)}>
                      Load
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(preset.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}