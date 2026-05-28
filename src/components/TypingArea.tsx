import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTyping } from "@/lib/typing-store";

interface CaretPos { top: number; left: number; height: number; }

export function TypingArea() {
  const words = useTyping((s) => s.words);
  const wordIndex = useTyping((s) => s.wordIndex);
  const charIndex = useTyping((s) => s.charIndex);
  const blindMode = useTyping((s) => s.blindMode);
  const finishedAt = useTyping((s) => s.finishedAt);
  const startedAt = useTyping((s) => s.startedAt);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);
  const [caret, setCaret] = useState<CaretPos>({ top: 0, left: 0, height: 28 });
  const [scrollY, setScrollY] = useState(0);

  // Visible window: render only a slice of words around the active one for perf
  const VISIBLE_AHEAD = 80;
  const VISIBLE_BEHIND = 20;
  const start = Math.max(0, wordIndex - VISIBLE_BEHIND);
  const end = Math.min(words.length, wordIndex + VISIBLE_AHEAD);
  const slice = useMemo(() => words.slice(start, end), [words, start, end]);

  // Caret + auto-scroll position
  useEffect(() => {
    const c = containerRef.current;
    const target = activeCharRef.current ?? activeWordRef.current;
    if (!c || !target) return;
    const cRect = c.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    let left = tRect.left - cRect.left;
    if (activeCharRef.current) {
      // caret on the right edge would only happen if charIndex equals length; we render caret before active char by default
    }
    const top = tRect.top - cRect.top + scrollY;
    setCaret({ top, left, height: tRect.height });

    // Auto-scroll: keep caret on the second line
    const lineH = tRect.height + 8;
    const visibleTop = scrollY;
    const visibleBottom = scrollY + (c.clientHeight || 0);
    const caretY = top;
    if (caretY < visibleTop) setScrollY(Math.max(0, caretY - lineH));
    else if (caretY > visibleBottom - lineH * 1.5) setScrollY(caretY - lineH);
  }, [wordIndex, charIndex, slice, scrollY]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto h-[180px] md:h-[200px] overflow-hidden font-mono text-2xl md:text-3xl leading-relaxed select-none"
      style={{ filter: blindMode ? "blur(2px)" : undefined }}
      aria-label="Typing area"
    >
      <div
        className="will-change-transform transition-transform duration-150 ease-out"
        style={{ transform: `translateY(${-scrollY}px)` }}
      >
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {slice.map((w, i) => {
            const realIndex = start + i;
            const isActive = realIndex === wordIndex;
            const isPast = realIndex < wordIndex;
            const typed = w.typed;
            const target = w.target;
            const len = Math.max(typed.length, target.length);
            return (
              <span
                key={realIndex}
                ref={isActive ? activeWordRef : undefined}
                className={`relative inline-flex ${isActive ? "text-foreground" : ""}`}
              >
                {Array.from({ length: len }).map((_, j) => {
                  const tch = target[j];
                  const uch = typed[j];
                  let cls = "text-[var(--untyped)]";
                  if (uch != null && tch != null) {
                    cls = uch === tch ? "text-[var(--correct)]" : "text-[var(--incorrect)] underline decoration-[var(--incorrect)]/60 underline-offset-4";
                  } else if (uch != null && tch == null) {
                    cls = "text-[var(--incorrect)]/80";
                  } else if (uch == null && tch != null && isPast) {
                    cls = "text-[var(--incorrect)]/40";
                  }
                  const isCaretHere = isActive && j === charIndex;
                  return (
                    <span
                      key={j}
                      ref={isCaretHere ? activeCharRef : undefined}
                      className={cls}
                    >
                      {tch ?? uch}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      </div>

      {/* Smooth caret */}
      {!finishedAt && (
        <motion.div
          aria-hidden
          className={`pointer-events-none absolute w-[2px] rounded-sm bg-[var(--caret)] ${startedAt ? "" : "caret-blink"}`}
          animate={{ top: caret.top - scrollY - 2, left: caret.left - 1, height: caret.height + 4 }}
          transition={{ type: "spring", stiffness: 900, damping: 60, mass: 0.4 }}
          style={{ boxShadow: "0 0 14px color-mix(in oklab, var(--caret) 60%, transparent)" }}
        />
      )}
    </div>
  );
}
