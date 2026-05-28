import { useLayoutEffect, useMemo, useRef, useState } from "react";
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
  const innerRef = useRef<HTMLDivElement | null>(null);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);
  const [caret, setCaret] = useState<CaretPos>({ top: 0, left: 0, height: 28 });
  const [scrollY, setScrollY] = useState(0);

  // Render a window of words around the active one for performance
  const VISIBLE_AHEAD = 60;
  const VISIBLE_BEHIND = 20;
  const start = Math.max(0, wordIndex - VISIBLE_BEHIND);
  const end = Math.min(words.length, wordIndex + VISIBLE_AHEAD);
  const slice = useMemo(() => words.slice(start, end), [words, start, end]);

  // Caret position + line-based scroll. useLayoutEffect to avoid flicker.
  useLayoutEffect(() => {
    const inner = innerRef.current;
    const word = activeWordRef.current;
    if (!inner || !word) return;

    // Caret position in inner coordinate space (NOT affected by scrollY).
    const innerRect = inner.getBoundingClientRect();
    const charEl = activeCharRef.current;
    let left: number;
    let top: number;
    let height: number;

    if (charEl) {
      const r = charEl.getBoundingClientRect();
      left = r.left - innerRect.left;
      top = r.top - innerRect.top;
      height = r.height;
    } else {
      // Past the end of the word: place caret right after last char
      const wRect = word.getBoundingClientRect();
      left = wRect.right - innerRect.left;
      top = wRect.top - innerRect.top;
      height = wRect.height;
    }
    setCaret({ top, left, height });

    // Line-based scroll: keep the active line on the 2nd visible line.
    const lineHeight = word.offsetHeight + 8; // gap-y-2 ~ 8px
    const wordTop = word.offsetTop;
    const targetScroll = Math.max(0, wordTop - lineHeight);
    setScrollY(targetScroll);
  }, [wordIndex, charIndex, slice]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto h-[180px] md:h-[200px] overflow-hidden font-mono text-2xl md:text-3xl leading-relaxed select-none"
      style={{ filter: blindMode ? "blur(2px)" : undefined }}
      aria-label="Typing area"
    >
      <div
        ref={innerRef}
        className="will-change-transform"
        style={{
          transform: `translate3d(0, ${-scrollY}px, 0)`,
          transition: "transform 120ms cubic-bezier(.22,1,.36,1)",
        }}
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
                className="relative inline-flex"
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
                      ref={isCaretHere ? activeCharRef : null}
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

      {/* Smooth caret — pure CSS transform for low latency */}
      {!finishedAt && (
        <div
          aria-hidden
          className={`pointer-events-none absolute top-0 left-0 w-[2px] rounded-sm bg-[var(--caret)] ${startedAt ? "" : "caret-blink"}`}
          style={{
            height: caret.height + 4,
            transform: `translate3d(${caret.left - 1}px, ${caret.top - scrollY - 2}px, 0)`,
            transition: "transform 60ms linear, height 80ms ease",
            boxShadow: "0 0 12px color-mix(in oklab, var(--caret) 55%, transparent)",
            willChange: "transform",
          }}
        />
      )}
    </div>
  );
}
