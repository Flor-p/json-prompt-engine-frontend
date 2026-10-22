'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Pause, Play, RotateCcw } from 'lucide-react';

type RoundMinutes = 10 | 15;

interface Milestone {
  /** Seconds since the clock started. */
  at: number;
  label: string;
}

/**
 * Competition plan: launches are always early; relaunch cut-offs and the
 * "on screen" deadline move 5 minutes later in the 15-minute final.
 */
const milestonesFor = (round: RoundMinutes): Milestone[] => {
  const shift = round === 15 ? 300 : 0;
  return [
    { at: 90, label: 'Seedance A' },
    { at: 150, label: 'Veo B' },
    { at: 195 + shift, label: 'Last Seedance' },
    { at: 330 + shift, label: 'Last Veo' },
    { at: 510 + shift, label: 'On screen' },
  ];
};

const fmt = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function DuelTimer() {
  const [round, setRound] = useState<RoundMinutes>(10);
  const [running, setRunning] = useState(false);
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [, setTick] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  const elapsedMs = accumulatedMs + (running && startedAtRef.current ? Date.now() - startedAtRef.current : 0);
  const elapsed = elapsedMs / 1000;
  const total = round * 60;
  const remaining = Math.max(0, total - elapsed);
  const timeUp = remaining <= 0;

  // Re-render a few times per second while running; wall-clock based, so no drift.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 200);
    return () => clearInterval(id);
  }, [running]);

  // Stop automatically at the buzzer.
  useEffect(() => {
    if (running && timeUp) {
      setAccumulatedMs(total * 1000);
      startedAtRef.current = null;
      setRunning(false);
    }
  }, [running, timeUp, total]);

  const start = () => {
    if (timeUp) return;
    startedAtRef.current = Date.now();
    setRunning(true);
  };

  const pause = () => {
    if (startedAtRef.current) setAccumulatedMs((ms) => ms + (Date.now() - startedAtRef.current!));
    startedAtRef.current = null;
    setRunning(false);
  };

  const reset = () => {
    startedAtRef.current = null;
    setRunning(false);
    setAccumulatedMs(0);
    setDone(new Set());
  };

  const toggleDone = (index: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const clockColor = timeUp
    ? 'text-red-500'
    : remaining <= 60
      ? 'text-red-500'
      : remaining <= 120
        ? 'text-orange-400'
        : 'text-zinc-900 dark:text-zinc-50';

  const isIdle = !running && accumulatedMs === 0;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-border bg-card px-4 py-3">
      {/* Round length */}
      <div className="flex overflow-hidden rounded-md border border-border">
        {([10, 15] as RoundMinutes[]).map((m) => (
          <button
            key={m}
            onClick={() => setRound(m)}
            disabled={!isIdle}
            className={`px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
              round === m ? 'bg-[#FEFF00] text-zinc-900' : 'text-zinc-500 hover:text-zinc-200 disabled:opacity-50'
            }`}
            aria-pressed={round === m}
          >
            {m} min
          </button>
        ))}
      </div>

      {/* Clock */}
      <div className="flex items-center gap-3">
        <span
          className={`font-mono text-5xl font-bold tabular-nums leading-none ${clockColor} ${
            remaining > 0 && remaining <= 60 && running ? 'animate-pulse' : ''
          }`}
          aria-live="off"
        >
          {timeUp ? 'TIME' : fmt(remaining)}
        </span>
        <div className="flex gap-1.5">
          {running ? (
            <button
              onClick={pause}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-zinc-200 hover:border-zinc-400"
              aria-label="Pause"
            >
              <Pause className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={start}
              disabled={timeUp}
              className="flex h-10 w-10 items-center justify-center rounded-md bg-[#FEFF00] text-zinc-900 hover:opacity-90 disabled:opacity-40"
              aria-label="Start"
            >
              <Play className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={reset}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-zinc-400 hover:border-zinc-400 hover:text-zinc-200"
            aria-label="Reset timer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Milestones: click to mark as done */}
      <div className="flex flex-wrap gap-2">
        {milestonesFor(round).map((m, i) => {
          const isDone = done.has(i);
          const overdue = !isDone && elapsed >= m.at;
          const soon = !isDone && !overdue && m.at - elapsed <= 30 && !isIdle;
          const style = isDone
            ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
            : overdue
              ? 'border-red-500/70 bg-red-500/10 text-red-400'
              : soon
                ? 'border-orange-400/70 bg-orange-400/10 text-orange-300 animate-pulse'
                : 'border-border text-zinc-500';
          return (
            <button
              key={m.label}
              onClick={() => toggleDone(i)}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${style}`}
              title="Click when done"
            >
              {isDone && <Check className="h-3 w-3" />}
              <span className="font-mono tabular-nums">{fmt(m.at)}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
