import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateWords, generateQuote } from "./words";

export type Mode = "time" | "words" | "quote";
export type CharState = "untyped" | "correct" | "incorrect" | "extra";

export interface WordState {
  target: string;
  typed: string;
}

export interface Sample {
  t: number;     // seconds since start
  wpm: number;   // rolling
  raw: number;   // raw wpm
  errors: number;
}

export interface Result {
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  errors: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  durationSec: number;
  mode: Mode;
  amount: number;
  punctuation: boolean;
  numbers: boolean;
  samples: Sample[];
  finishedAt: number;
}

interface Settings {
  mode: Mode;
  timeAmount: number;        // seconds
  wordsAmount: number;       // count
  quoteAmount: number;       // approx words in quote
  punctuation: boolean;
  numbers: boolean;
  soundEnabled: boolean;
  blindMode: boolean;
  zenMode: boolean;
  strictBackspace: boolean;  // if true, can't backspace past completed words
  theme: "dark" | "light" | "system";
}

interface TypingState extends Settings {
  // session
  words: WordState[];
  wordIndex: number;
  charIndex: number;       // index within current typed buffer of current word
  startedAt: number | null;
  finishedAt: number | null;
  errorsTotal: number;
  correctTotal: number;
  incorrectTotal: number;
  extraTotal: number;
  samples: Sample[];
  result: Result | null;
  personalBest: { wpm: number; mode: Mode; amount: number } | null;

  // actions
  setSettings: (s: Partial<Settings>) => void;
  reset: (regenerate?: boolean) => void;
  typeChar: (ch: string) => void;
  backspace: (word?: boolean) => void;
  pushSpace: () => void;
  tick: (now: number) => void;
  finish: () => void;
}

function buildWords(s: Pick<Settings, "mode" | "timeAmount" | "wordsAmount" | "quoteAmount" | "punctuation" | "numbers">): WordState[] {
  if (s.mode === "quote") {
    const { words } = generateQuote(s.quoteAmount);
    return words.map((w) => ({ target: w, typed: "" }));
  }
  // For time mode we generate a generous buffer; we'll extend as user types.
  const count = s.mode === "words" ? s.wordsAmount : Math.max(80, s.timeAmount * 5);
  return generateWords({ count, punctuation: s.punctuation, numbers: s.numbers }).map((w) => ({
    target: w,
    typed: "",
  }));
}

export const useTyping = create<TypingState>()(
  persist(
    (set, get) => ({
      mode: "time",
      timeAmount: 30,
      wordsAmount: 25,
      quoteAmount: 15,
      punctuation: false,
      numbers: false,
      soundEnabled: false,
      blindMode: false,
      zenMode: false,
      strictBackspace: false,
      theme: "dark",

      words: [],
      wordIndex: 0,
      charIndex: 0,
      startedAt: null,
      finishedAt: null,
      errorsTotal: 0,
      correctTotal: 0,
      incorrectTotal: 0,
      extraTotal: 0,
      samples: [],
      result: null,
      personalBest: null,

      setSettings: (s) => {
        set(s);
        get().reset(true);
      },

      reset: (regenerate = true) => {
        const s = get();
        set({
          words: regenerate || s.words.length === 0 ? buildWords(s) : s.words.map((w) => ({ ...w, typed: "" })),
          wordIndex: 0,
          charIndex: 0,
          startedAt: null,
          finishedAt: null,
          errorsTotal: 0,
          correctTotal: 0,
          incorrectTotal: 0,
          extraTotal: 0,
          samples: [],
          result: null,
        });
      },

      typeChar: (ch) => {
        const s = get();
        if (s.finishedAt) return;
        const now = performance.now();
        const startedAt = s.startedAt ?? now;
        const w = s.words[s.wordIndex];
        if (!w) return;
        const newTyped = w.typed + ch;
        const target = w.target;
        let correctTotal = s.correctTotal;
        let incorrectTotal = s.incorrectTotal;
        let extraTotal = s.extraTotal;
        let errorsTotal = s.errorsTotal;

        if (newTyped.length <= target.length) {
          if (ch === target[newTyped.length - 1]) {
            correctTotal++;
          } else {
            incorrectTotal++;
            errorsTotal++;
          }
        } else {
          extraTotal++;
          errorsTotal++;
        }

        const newWords = s.words.slice();
        newWords[s.wordIndex] = { ...w, typed: newTyped };
        set({
          words: newWords,
          charIndex: newTyped.length,
          startedAt,
          correctTotal,
          incorrectTotal,
          extraTotal,
          errorsTotal,
        });

        // Auto-finish: reached the end of the last word in words mode
        if (s.mode === "words" && s.wordIndex === s.wordsAmount - 1 && newTyped.length >= target.length) {
          get().finish();
        }
      },


      pushSpace: () => {
        const s = get();
        if (s.finishedAt) return;
        const w = s.words[s.wordIndex];
        if (!w || w.typed.length === 0) return;
        // Count uncompleted/missing chars as missed (for accuracy stats handled in finish).
        const nextIndex = s.wordIndex + 1;

        // Extend buffer in time mode
        let words = s.words;
        if (s.mode === "time" && nextIndex >= words.length - 10) {
          const more = generateWords({ count: 40, punctuation: s.punctuation, numbers: s.numbers }).map((t) => ({
            target: t,
            typed: "",
          }));
          words = [...words, ...more];
        }

        set({ words, wordIndex: nextIndex, charIndex: 0 });

        if (s.mode === "words" && nextIndex >= s.wordsAmount) {
          get().finish();
        }
      },

      backspace: (word = false) => {
        const s = get();
        if (s.finishedAt) return;
        const w = s.words[s.wordIndex];
        if (!w) return;
        if (w.typed.length === 0) {
          if (s.strictBackspace) return;
          if (s.wordIndex === 0) return;
          // Move to previous word and keep its typed buffer
          const prev = s.wordIndex - 1;
          set({ wordIndex: prev, charIndex: s.words[prev].typed.length });
          return;
        }
        const newTyped = word ? "" : w.typed.slice(0, -1);
        const newWords = s.words.slice();
        newWords[s.wordIndex] = { ...w, typed: newTyped };
        set({ words: newWords, charIndex: newTyped.length });
      },

      tick: (now) => {
        const s = get();
        if (!s.startedAt || s.finishedAt) return;
        const elapsed = (now - s.startedAt) / 1000;
        if (elapsed <= 0) return;

        // compute wpm based on correctly typed chars so far across completed + current
        let correctChars = 0;
        let typedChars = 0;
        for (let i = 0; i <= s.wordIndex && i < s.words.length; i++) {
          const w = s.words[i];
          const len = Math.min(w.typed.length, w.target.length);
          for (let j = 0; j < len; j++) {
            typedChars++;
            if (w.typed[j] === w.target[j]) correctChars++;
          }
          typedChars += Math.max(0, w.typed.length - w.target.length);
          if (i < s.wordIndex) {
            // count trailing space as a typed char
            typedChars++;
            correctChars++;
          }
        }
        const wpm = (correctChars / 5) / (elapsed / 60);
        const raw = (typedChars / 5) / (elapsed / 60);

        const samples = s.samples.slice();
        const tSec = Math.floor(elapsed);
        if (samples.length === 0 || samples[samples.length - 1].t !== tSec) {
          samples.push({ t: tSec, wpm: Math.round(wpm), raw: Math.round(raw), errors: s.errorsTotal });
        } else {
          samples[samples.length - 1] = { t: tSec, wpm: Math.round(wpm), raw: Math.round(raw), errors: s.errorsTotal };
        }
        set({ samples });

        if (s.mode === "time" && elapsed >= s.timeAmount) {
          get().finish();
        }
      },

      finish: () => {
        const s = get();
        if (s.finishedAt || !s.startedAt) {
          if (!s.startedAt) return;
        }
        const now = performance.now();
        const elapsed = Math.max(0.001, (now - (s.startedAt ?? now)) / 1000);

        let correctChars = 0;
        let incorrectChars = 0;
        let extraChars = 0;
        let missedChars = 0;
        const lastIndex = s.mode === "words" ? s.wordsAmount - 1 : s.wordIndex;
        for (let i = 0; i <= lastIndex && i < s.words.length; i++) {
          const w = s.words[i];
          const minLen = Math.min(w.typed.length, w.target.length);
          for (let j = 0; j < minLen; j++) {
            if (w.typed[j] === w.target[j]) correctChars++;
            else incorrectChars++;
          }
          if (w.typed.length > w.target.length) extraChars += w.typed.length - w.target.length;
          if (i < s.wordIndex && w.typed.length < w.target.length) missedChars += w.target.length - w.typed.length;
        }
        // spaces between completed words
        correctChars += Math.max(0, s.wordIndex);

        const wpm = (correctChars / 5) / (elapsed / 60);
        const raw = ((correctChars + incorrectChars + extraChars) / 5) / (elapsed / 60);
        const totalTyped = correctChars + incorrectChars + extraChars;
        const accuracy = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 0;

        // Consistency from samples (coefficient of variation of raw wpm)
        const xs = s.samples.map((x) => x.raw).filter((n) => n > 0);
        let consistency = 0;
        if (xs.length > 1) {
          const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
          const variance = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length;
          const sd = Math.sqrt(variance);
          consistency = Math.max(0, Math.min(100, 100 * (1 - sd / (mean || 1))));
        }

        const result: Result = {
          wpm: Math.round(wpm),
          raw: Math.round(raw),
          accuracy: Math.round(accuracy * 10) / 10,
          consistency: Math.round(consistency * 10) / 10,
          errors: s.errorsTotal,
          correctChars,
          incorrectChars,
          extraChars,
          missedChars,
          durationSec: Math.round(elapsed * 10) / 10,
          mode: s.mode,
          amount: s.mode === "time" ? s.timeAmount : s.wordsAmount,
          punctuation: s.punctuation,
          numbers: s.numbers,
          samples: s.samples,
          finishedAt: Date.now(),
        };

        const pb = s.personalBest;
        const newPB =
          !pb || (pb.mode === s.mode && pb.amount === result.amount && result.wpm > pb.wpm) || pb.mode !== s.mode
            ? { wpm: result.wpm, mode: s.mode, amount: result.amount }
            : pb;

        set({ finishedAt: now, result, personalBest: newPB });
      },
    }),
    {
      name: "kerntype-store",
      partialize: (s) => ({
        mode: s.mode,
        timeAmount: s.timeAmount,
        wordsAmount: s.wordsAmount,
        punctuation: s.punctuation,
        numbers: s.numbers,
        soundEnabled: s.soundEnabled,
        blindMode: s.blindMode,
        zenMode: s.zenMode,
        strictBackspace: s.strictBackspace,
        theme: s.theme,
        personalBest: s.personalBest,
      }),
    }
  )
);
