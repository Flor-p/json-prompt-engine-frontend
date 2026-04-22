'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { ModelSchema } from '@/config/modelSchemas';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  fields?: Record<string, any>;
}

interface PromptChatbotProps {
  activeModel: string;
  currentModelSchema: ModelSchema | undefined;
  onApplyFields: (fields: Record<string, any>) => void;
}

export function PromptChatbot({ activeModel, currentModelSchema, onApplyFields }: PromptChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          activeModel,
          modelSchema: currentModelSchema,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${data.error}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.explanation || 'Done.',
            fields:
              data.fields && Object.keys(data.fields).length > 0 ? data.fields : undefined,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Connection failed. Make sure ANTHROPIC_API_KEY is set in .env.local.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-32 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 md:bottom-6 md:right-6"
        style={{ backgroundColor: '#FEFF00' }}
        aria-label="Open AI prompt assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-zinc-900" />
        ) : (
          <Bot className="h-6 w-6 text-zinc-900" />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-52 right-4 z-[60] flex h-[420px] max-h-[calc(100vh-14rem)] w-[calc(100vw-2rem)] flex-col rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl sm:w-96 md:bottom-24 md:right-6 md:h-[500px] md:max-h-[calc(100vh-7rem)]">
          {/* Header */}
          <div
            className="flex items-center justify-between rounded-t-2xl px-4 py-3"
            style={{ backgroundColor: '#FEFF00' }}
          >
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-zinc-900" />
              <span className="text-sm font-semibold text-zinc-900">AI Prompt Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-zinc-900 transition-colors hover:bg-black/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Model context */}
          <div className="border-b border-zinc-800 px-4 py-2">
            <span className="text-xs text-zinc-500">
              Working with{' '}
              <span className="font-medium" style={{ color: '#FEFF00' }}>
                {currentModelSchema?.name || activeModel}
              </span>
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <Sparkles className="h-8 w-8 text-zinc-600" />
                <p className="text-sm text-zinc-500">
                  Ask me to help craft your{' '}
                  <span className="font-medium text-zinc-400">
                    {currentModelSchema?.name || activeModel}
                  </span>{' '}
                  prompt.
                </p>
                <p className="text-xs text-zinc-600">
                  Try: &ldquo;Create a dramatic cinematic sunset scene&rdquo;
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-zinc-700 text-zinc-200'
                      : 'bg-zinc-800 text-zinc-200'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'assistant' && msg.fields && (
                  <button
                    onClick={() => onApplyFields(msg.fields!)}
                    className="ml-1 rounded-md px-3 py-1 text-xs font-semibold text-zinc-900 transition-opacity hover:opacity-80 active:scale-95"
                    style={{ backgroundColor: '#FEFF00' }}
                  >
                    Apply to fields
                  </button>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start">
                <div className="rounded-xl bg-zinc-800 px-4 py-3">
                  <span className="flex gap-1">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-zinc-800 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for prompt help..."
                rows={2}
                className="flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-[#FEFF00]/60"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="mb-0 flex h-[60px] w-10 flex-shrink-0 items-center justify-center rounded-lg text-zinc-900 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: '#FEFF00' }}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-zinc-600">
              Enter to send · Shift+Enter for newline
            </p>
          </div>
        </div>
      )}
    </>
  );
}
