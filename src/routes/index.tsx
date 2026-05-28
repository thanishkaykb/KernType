import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useTyping } from "@/lib/typing-store";
import { useKeyboard } from "@/hooks/use-keyboard";
import { TypingArea } from "@/components/TypingArea";
import { ConfigBar } from "@/components/ConfigBar";
import { LiveStats } from "@/components/LiveStats";
import { Results } from "@/components/Results";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "kerntype — minimalist typing test" },
      { name: "description", content: "A buttery-smooth, distraction-free typing test focused on flow state, precise stats and beautiful design." },
      { property: "og:title", content: "kerntype — minimalist typing test" },
      { property: "og:description", content: "A buttery-smooth, distraction-free typing test focused on flow state and precise stats." },
    ],
  }),
  component: Home,
});

function Home() {
  const reset = useTyping((s) => s.reset);
  const tick = useTyping((s) => s.tick);
  const startedAt = useTyping((s) => s.startedAt);
  const finishedAt = useTyping((s) => s.finishedAt);
  const result = useTyping((s) => s.result);
  const wordsLen = useTyping((s) => s.words.length);
  const [bootKey, setBootKey] = useState(0);

  // initial words generation on mount
  useEffect(() => {
    if (wordsLen === 0) reset(true);
  }, [wordsLen, reset]);

  const restart = useCallback(() => {
    reset(true);
    setBootKey((k) => k + 1);
  }, [reset]);

  useKeyboard(restart);

  // ticking loop for stats + auto-finish in time mode
  useEffect(() => {
    if (!startedAt || finishedAt) return;
    let raf = 0;
    const loop = () => {
      tick(performance.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [startedAt, finishedAt, tick]);

  return (
    <main className="min-h-dvh flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 pb-16">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key={`test-${bootKey}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center gap-6"
            >
              <ConfigBar />
              <LiveStats />
              <TypingArea />
              <p className="text-xs font-mono text-muted-foreground/70">
                press <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground/80">tab</kbd> to restart · just start typing
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Results onRestart={restart} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
