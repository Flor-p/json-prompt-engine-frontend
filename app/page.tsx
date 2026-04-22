'use client';

import { useEffect, useState } from 'react';
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
import { RotateCcw, Code } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { PromptChatbot } from '@/components/PromptChatbot';

export default function Home() {
  const [showJson, setShowJson] = useState(false);

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

  const handleApplyFields = (fields: Record<string, any>) => {
    Object.entries(fields).forEach(([key, value]) => {
      updateField(key, value);
    });
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
          {/* Mobile: two rows. Tablet+Desktop: single row */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-0">
            {/* Row 1 (mobile) / Left side (md+): logo + title */}
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
                className="text-zinc-900 dark:text-zinc-100"
                style={{ fontFamily: 'var(--font-bungee)' }}
              >
                {/* Mobile: two lines */}
                <span className="md:hidden">
                  <span className="block text-sm leading-tight">JSON PROMPT</span>
                  <span className="block text-sm leading-tight">ENGINE</span>
                </span>
                {/* Tablet + Desktop: single line */}
                <span className="hidden md:block text-2xl">JSON Prompt Engine</span>
              </h1>
            </div>
            {/* Row 2 (mobile) / Right side (md+): action buttons */}
            <div className="flex items-center justify-between gap-2 md:justify-end md:gap-4">
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
                className="h-7 gap-1 px-2 text-xs md:h-9 md:gap-2 md:px-3 md:text-sm"
              >
                <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6 pb-36 md:pb-6">
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'image' | 'video')}>
            <TabsList className="bg-zinc-200 dark:bg-zinc-900">
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={activeModel} onValueChange={setActiveModel}>
            <SelectTrigger className="w-[200px] sm:w-[280px] bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700">
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

          <button
            onClick={() => setShowJson((v) => !v)}
            className="lg:hidden ml-auto flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Code className="h-3 w-3" />
            {showJson ? 'Hide JSON' : 'Advanced'}
          </button>
        </div>

        {/* Panels — DOM order: Fields → Output → JSON so that on tablet (2-col)
            Fields+Output share row 1 and JSON (when toggled) spans row 2.
            On desktop the order is reset to Fields | JSON | Output via lg:order-* */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:h-[calc(100vh-240px)]">
          {/* Fields */}
          <div className="order-1 lg:order-1 min-h-[250px] overflow-auto rounded-lg border border-border bg-card p-6 lg:min-h-0">
            <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
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

          {/* Output — hidden on mobile (rendered as fixed bottom bar instead); visible md+ */}
          <div className="hidden md:block order-2 lg:order-3 min-h-[200px] overflow-hidden rounded-lg border border-border bg-card p-6 lg:min-h-0">
            <OutputDisplay
              output={outputText}
              jsonData={currentData}
              modelName={activeModel}
            />
          </div>

          {/* JSON Editor — hidden on mobile/tablet unless toggled; always visible on desktop */}
          <div
            className={`order-3 lg:order-2 min-h-[250px] overflow-hidden rounded-lg border border-border bg-card p-6 lg:min-h-0 md:col-span-2 lg:col-span-1 ${
              showJson ? 'block' : 'hidden lg:block'
            }`}
          >
            <JsonEditor
              value={currentData}
              onChange={setCurrentData}
              onError={setJsonError}
            />
          </div>
        </div>
      </div>
      {/* Mobile-only sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-md px-4 py-2 max-h-[120px] overflow-y-auto">
        <OutputDisplay
          output={outputText}
          jsonData={currentData}
          modelName={activeModel}
          compact
        />
      </div>

      <PromptChatbot
        activeModel={activeModel}
        currentModelSchema={currentModelSchema}
        onApplyFields={handleApplyFields}
      />

      <footer className="font-mono text-xs py-4 text-center text-black dark:text-[#FEFF00]">
        JSON Prompt Engine v1.1.0 · Built by Flor Paramidani ·{' '}
        <a
          href="https://www.linkedin.com/in/florpara/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-70"
        >
          LinkedIn ↗
        </a>
        {' · '}
        <a
          href="https://github.com/Flor-p"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-70"
        >
          GitHub ↗
        </a>
        {' · '}
        <a
          href="mailto:florparamidani@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70"
        >
          florparamidani@gmail.com
        </a>
      </footer>
    </div>
  );
}