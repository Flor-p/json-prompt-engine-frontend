'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Copy, Shuffle, Trash2, ImagePlus, Loader2, ScanEye } from 'lucide-react';
import { toast } from 'sonner';
import { ModelSchema } from '@/config/modelSchemas';
import { transformData } from '@/lib/transformers';
import { ACCEPTED_IMAGE_TYPES, ImageAttachment, ImageAttachmentError, prepareImage } from '@/lib/imageAttachment';

type Take = 'A' | 'B';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  fields?: Record<string, any>;
  /** Brief that produced this answer — reused to request take B. */
  brief?: string;
  /** Reference image sent with the brief — shown in the bubble and reused for take B. */
  image?: ImageAttachment;
  take?: Take;
  /** Plain-text answer of "Describe" mode, copyable as is. */
  description?: string;
}

interface PromptChatbotProps {
  activeModel: string;
  currentModelSchema: ModelSchema | undefined;
  /** Current field values, so a copied prompt keeps the technical settings already chosen. */
  currentData: Record<string, any>;
  onApplyFields: (fields: Record<string, any>) => void;
  /** Incremented by the page's Reset button: clears the conversation. */
  clearSignal?: number;
}

export function PromptChatbot({ activeModel, currentModelSchema, currentData, onApplyFields, clearSignal = 0 }: PromptChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<ImageAttachment | null>(null);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** Bumped on every clear, so a response that arrives after a reset is discarded. */
  const sessionRef = useRef(0);

  const clearChat = () => {
    sessionRef.current += 1;
    setMessages([]);
    setInput('');
    setImage(null);
    setIsLoading(false);
  };

  const attachImage = async (file: File | null | undefined) => {
    if (!file || isPreparingImage) return;
    setIsPreparingImage(true);
    try {
      setImage(await prepareImage(file));
      inputRef.current?.focus();
    } catch (err) {
      toast.error(err instanceof ImageAttachmentError ? err.message : 'Could not attach this image');
    } finally {
      setIsPreparingImage(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const file = Array.from(e.clipboardData.items)
      .find((item) => item.kind === 'file' && item.type.startsWith('image/'))
      ?.getAsFile();
    if (!file) return;
    e.preventDefault();
    attachImage(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    attachImage(Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/')));
  };

  useEffect(() => {
    if (clearSignal > 0) clearChat();
  }, [clearSignal]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const requestFields = async (
    brief: string,
    take: Take,
    refImage?: ImageAttachment,
    variationOf?: Record<string, any>,
  ) => {
    const session = sessionRef.current;
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: brief,
          activeModel,
          modelSchema: currentModelSchema,
          settings: { shots: currentData.shots, duration: currentData.duration },
          ...(refImage ? { image: { mediaType: refImage.mediaType, data: refImage.data } } : {}),
          ...(variationOf ? { variationOf } : {}),
        }),
      });

      // A 413 from the platform comes back as HTML, not JSON.
      const data = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
      if (session !== sessionRef.current) return;

      if (data.error) {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
        return;
      }

      const fields = data.fields && Object.keys(data.fields).length > 0 ? data.fields : undefined;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `${take === 'B' ? 'Take B · ' : ''}${data.explanation || 'Done.'}`,
          fields,
          brief,
          image: refImage,
          take,
        },
      ]);
    } catch {
      if (session !== sessionRef.current) return;
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection failed. Use the fields manually.' }]);
    } finally {
      if (session === sessionRef.current) setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !image) || isLoading || isPreparingImage) return;
    const brief = input.trim();
    const refImage = image ?? undefined;
    setInput('');
    setImage(null);
    setMessages((prev) => [...prev, { role: 'user', content: brief, image: refImage }]);
    await requestFields(brief, 'A', refImage);
  };

  /** Readable Spanish description of the attached image, without touching the prompt fields. */
  const describeImage = async () => {
    if (!image || isLoading || isPreparingImage) return;
    const note = input.trim();
    const refImage = image;
    const session = sessionRef.current;
    setInput('');
    setImage(null);
    setMessages((prev) => [...prev, { role: 'user', content: note || 'Describe this image', image: refImage }]);
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'describe',
          message: note,
          image: { mediaType: refImage.mediaType, data: refImage.data },
        }),
      });
      const data = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
      if (session !== sessionRef.current) return;
      if (data.error) {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
        return;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.description, description: data.description }]);
    } catch {
      if (session !== sessionRef.current) return;
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection failed. Try again.' }]);
    } finally {
      if (session === sessionRef.current) setIsLoading(false);
    }
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Description copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const requestTakeB = async (msg: Message) => {
    if (msg.brief === undefined || !msg.fields || isLoading) return;
    await requestFields(msg.brief, 'B', msg.image, msg.fields);
  };

  /** Builds the final prompt for a take without touching the form, and copies it. */
  const copyTake = async (msg: Message) => {
    if (!msg.fields) return;
    const prompt = transformData(activeModel, { ...currentData, ...msg.fields });
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success(`Take ${msg.take ?? 'A'} copied`);
    } catch {
      toast.error('Failed to copy');
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
        <div
          onDragOver={(e) => {
            if (!Array.from(e.dataTransfer.types).includes('Files')) return;
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={`fixed bottom-52 right-4 z-[60] flex h-[420px] max-h-[calc(100vh-14rem)] w-[calc(100vw-2rem)] flex-col rounded-2xl border bg-zinc-900 shadow-2xl sm:w-96 md:bottom-24 md:right-6 md:h-[500px] md:max-h-[calc(100vh-7rem)] ${
            isDragging ? 'border-[#FEFF00]' : 'border-zinc-700'
          }`}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between rounded-t-2xl px-4 py-3"
            style={{ backgroundColor: '#FEFF00' }}
          >
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-zinc-900" />
              <span className="text-sm font-semibold text-zinc-900">AI Prompt Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                disabled={messages.length === 0 && !input && !image}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-900 transition-colors hover:bg-black/10 disabled:opacity-40"
                aria-label="New chat"
                title="New chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
                New
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-zinc-900 transition-colors hover:bg-black/10"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
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
                <p className="text-xs text-zinc-600">
                  Or attach an image: alone it becomes the prompt, with text it&rsquo;s the reference.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.role === 'user' && msg.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={msg.image.dataUrl}
                    alt="Reference image"
                    className="max-h-32 max-w-[85%] rounded-xl border border-zinc-700 object-cover"
                  />
                )}
                {(msg.content || msg.role === 'assistant') && (
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-zinc-700 text-zinc-200'
                        : 'bg-zinc-800 text-zinc-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                )}
                {msg.role === 'assistant' && msg.description && (
                  <div className="ml-1 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => copyText(msg.description!)}
                      className="flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold text-zinc-900 transition-opacity hover:opacity-80 active:scale-95"
                      style={{ backgroundColor: '#FEFF00' }}
                    >
                      <Copy className="h-3 w-3" />
                      Copy description
                    </button>
                  </div>
                )}
                {msg.role === 'assistant' && msg.fields && (
                  <div className="ml-1 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => copyTake(msg)}
                      className="flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold text-zinc-900 transition-opacity hover:opacity-80 active:scale-95"
                      style={{ backgroundColor: '#FEFF00' }}
                    >
                      <Copy className="h-3 w-3" />
                      Copy {msg.take ?? 'A'}
                    </button>
                    <button
                      onClick={() => onApplyFields(msg.fields!)}
                      className="rounded-md border border-zinc-600 px-3 py-1 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-400 active:scale-95"
                    >
                      Apply to fields
                    </button>
                    {msg.take === 'A' && (
                      <button
                        onClick={() => requestTakeB(msg)}
                        disabled={isLoading}
                        className="flex items-center gap-1 rounded-md border border-zinc-600 px-3 py-1 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-400 active:scale-95 disabled:opacity-40"
                      >
                        <Shuffle className="h-3 w-3" />
                        Take B
                      </button>
                    )}
                  </div>
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
            {(image || isPreparingImage) && (
              <div className="mb-2 flex items-center gap-2">
                {image ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.dataUrl}
                      alt="Attached reference"
                      className="h-14 w-14 rounded-lg border border-zinc-700 object-cover"
                    />
                    <button
                      onClick={() => setImage(null)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-zinc-200 transition-colors hover:bg-zinc-600"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-zinc-700">
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                  </div>
                )}
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[11px] text-zinc-500">
                    {input.trim() ? 'Send: image used as reference' : 'Send: image becomes the prompt'}
                  </span>
                  {image && (
                    <button
                      onClick={describeImage}
                      disabled={isLoading}
                      className="flex items-center gap-1 rounded-md border border-zinc-600 px-2 py-0.5 text-[11px] font-medium text-zinc-200 transition-colors hover:border-zinc-400 disabled:opacity-40"
                      title="Get a readable description of the image (in Spanish)"
                    >
                      <ScanEye className="h-3 w-3" />
                      Describe
                    </button>
                  )}
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              className="hidden"
              onChange={(e) => {
                attachImage(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <div className="flex items-end gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isPreparingImage || isLoading}
                className="flex h-[60px] w-10 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40"
                aria-label="Attach reference image"
                title="Attach reference image"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={image ? 'What to do with the image (optional)...' : 'Ask for prompt help...'}
                rows={2}
                className="flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-[#FEFF00]/60"
              />
              <button
                onClick={sendMessage}
                disabled={(!input.trim() && !image) || isLoading || isPreparingImage}
                className="mb-0 flex h-[60px] w-10 flex-shrink-0 items-center justify-center rounded-lg text-zinc-900 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: '#FEFF00' }}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-zinc-600">
              Enter to send · Shift+Enter for newline · Paste or drop an image
            </p>
          </div>
        </div>
      )}
    </>
  );
}
