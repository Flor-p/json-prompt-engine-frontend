'use client';

import { useEffect, useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface JsonEditorProps {
  value: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  onError: (error: string | null) => void;
}

export function JsonEditor({ value, onChange, onError }: JsonEditorProps) {
  const [jsonText, setJsonText] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const isUserEditing = useRef(false);

  // Solo sincroniza desde afuera si el usuario NO está editando
  useEffect(() => {
    if (!isUserEditing.current) {
      setJsonText(JSON.stringify(value, null, 2));
      setLocalError(null);
      onError(null);
    }
  }, [value]);

  const handleChange = (text: string) => {
    isUserEditing.current = true;
    setJsonText(text);

    if (!text.trim()) {
      setLocalError(null);
      onError(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      setLocalError(null);
      onError(null);
      onChange(parsed);
      // Sync completado — el exterior ya tiene el valor correcto
      isUserEditing.current = false;
    } catch (err) {
      // JSON inválido — extraer posición del error si está disponible
      const raw = err instanceof Error ? err.message : 'Invalid JSON';
      const posMatch = raw.match(/position (\d+)/);
      const error = posMatch
        ? `JSON inválido en posición ${posMatch[1]}`
        : 'JSON inválido — revisá comas y llaves';
      setLocalError(error);
      onError(error);
    }
  };

  const handleBlur = () => {
    // Al salir del editor, re-sincroniza si hay error (resetea al último válido)
    if (localError) {
      setJsonText(JSON.stringify(value, null, 2));
      setLocalError(null);
      onError(null);
      isUserEditing.current = false;
    }
  };

  return (
    <div className="space-y-2 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200">JSON Editor</h3>
        {localError && (
          <span className="text-xs text-red-400 font-mono">{localError}</span>
        )}
        {!localError && (
          <span className="text-xs text-zinc-600 font-mono">valid JSON</span>
        )}
      </div>
      <Textarea
        value={jsonText}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
       className={`flex-1 font-mono text-sm bg-zinc-900 dark:bg-zinc-900 text-zinc-100 border-zinc-700 resize-none transition-colors ${
          localError
            ? 'border-red-500 focus-visible:ring-red-500'
            : 'border-zinc-700'
        }`}
        placeholder="Edit JSON here..."
        spellCheck={false}
      />
    </div>
  );
}