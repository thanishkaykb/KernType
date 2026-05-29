import { useEffect, useState } from "react";
import { useTyping } from "@/lib/typing-store";

export function LiveStats() {
  const startedAt = useTyping((s) => s.startedAt);
  const finishedAt = useTyping((s) => s.finishedAt);
  const samples = useTyping((s) => s.samples);
  const mode = useTyping((s) => s.mode);
  const timeAmount = useTyping((s) => s.timeAmount);
  const wordsAmount = useTyping((s) => s.wordsAmount);
  const quoteAmount = useTyping((s) => s.quoteAmount);
  const totalWords = useTyping((s) => s.words.length);
  const zen = useTyping((s) => s.zenMode);
  const [now, setNow] = useState<number>(performance.now());

  useEffect(() => {
    if (!startedAt || finishedAt) return;
    let raf = 0;
    const loop = () => {
      setNow(performance.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [startedAt, finishedAt]);

  const elapsed = startedAt ? Math.min((now - startedAt) / 1000, timeAmount) : 0;
  const remaining = mode === "time" ? Math.max(0, timeAmount - elapsed) : 0;
  const wpm = samples.length ? samples[samples.length - 1].wpm : 0;

  if (zen) return <div className="h-6" />;

  return (
    <div className="flex items-center gap-6 font-mono text-sm text-muted-foreground h-6">
      {mode === "time" ? (
        <span className="text-primary text-base tabular-nums">{Math.ceil(remaining)}s</span>
      ) : (
        <span className="text-primary text-base tabular-nums">{Math.min(wordIndex, wordsAmount)}/{wordsAmount}</span>
      )}
      {startedAt && !finishedAt && (
        <>
          <span className="tabular-nums"><span className="text-foreground/80">{wpm}</span> wpm</span>
        </>
      )}
    </div>
  );
}
