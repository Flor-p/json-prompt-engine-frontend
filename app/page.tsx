'use client';

import { useEffect } from 'react';
import { usePromptStore } from '@/lib/store';
import { getModelsByTab, getModelById } from '@/config/modelSchemas';
import { transformData } from '@/lib/transformers';
import { FieldRenderer } from '@/components/FieldRenderer';
import { JsonEditor } from '@/components/JsonEditor';
import { OutputDisplay } from '@/components/OutputDisplay';
import { PresetsManager } from '@/components/PresetsManager';
import { HistoryViewer, addToHistory, HistoryEntry } from '@/components/HistoryViewer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  const {
    activeTab,
    activeModel,
    currentData,
    jsonError,
    outputText,
    setActiveTab,
    setActiveModel,
    updateField,
    setCurrentData,
    setJsonError,
    setOutputText,
    resetToDefaults,
  } = usePromptStore();

  const currentModelSchema = getModelById(activeModel);
  const availableModels = getModelsByTab(activeTab);

  useEffect(() => {
    if (currentModelSchema && !jsonError) {
      const output = transformData(activeModel, currentData);
      setOutputText(output);

      if (output && output !== 'Empty prompt' && output !== '/imagine prompt: [empty]') {
        addToHistory({
          model: activeModel,
          tab: activeTab,
          data: currentData,
          output,
        });
      }
    }
  }, [currentData, activeModel, jsonError]);

  const handleLoadPreset = (data: Record<string, any>) => {
    setCurrentData(data);
  };

  const handleLoadHistory = (entry: HistoryEntry) => {
    if (entry.tab !== activeTab) setActiveTab(entry.tab);
    if (entry.model !== activeModel) setActiveModel(entry.model);
    setTimeout(() => {
      setCurrentData(entry.data);
    }, 100);
  };

  return (
    <div className="min-h-screen">
      <Toaster />

      <header className="border-b border-border bg-card backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <video
  src="/esphere.mp4"
  autoPlay
  loop
  muted
  playsInline
  className="h-12 w-12 object-contain"
/>
              <h1
                className="text-2xl text-zinc-900 dark:text-zinc-100"
                style={{ fontFamily: 'var(--font-bungee)' }}
              >
                JSON Prompt Engine
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <PresetsManager
                currentModel={activeModel}
                currentTab={activeTab}
                currentData={currentData}
                onLoadPreset={handleLoadPreset}
              />
              <HistoryViewer onLoadHistory={handleLoadHistory} />
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="mb-6 flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'image' | 'video')}>
            <TabsList className="bg-zinc-200 dark:bg-zinc-900">
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={activeModel} onValueChange={setActiveModel}>
            <SelectTrigger className="w-[280px] bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700">
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-240px)]">
          <div className="bg-card border border-border rounded-lg p-6 overflow-auto">
            <h2 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
              Fields
            </h2>
            {currentModelSchema && (
              <div className="space-y-4">
                {currentModelSchema.fields.map((field) => (
                  <FieldRenderer
                    key={field.name}
                    field={field}
                    value={currentData[field.name]}
                    onChange={(value) => updateField(field.name, value)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-6 overflow-hidden">
            <JsonEditor
              value={currentData}
              onChange={setCurrentData}
              onError={setJsonError}
            />
          </div>

          <div className="bg-card border border-border rounded-lg p-6 overflow-hidden">
            <OutputDisplay
              output={outputText}
              jsonData={currentData}
              modelName={activeModel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}