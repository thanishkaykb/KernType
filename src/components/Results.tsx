import { motion } from "framer-motion";
import { useTyping } from "@/lib/typing-store";
import { WpmChart } from "./WpmChart";
import { RotateCcw } from "lucide-react";

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col"
    >
      <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">{label}</span>
      <span className="text-4xl md:text-5xl font-mono text-primary tabular-nums leading-tight">{value}</span>
      {sub && <span className="text-xs text-muted-foreground font-mono mt-0.5">{sub}</span>}
    </motion.div>
  );
}

export function Results({ onRestart }: { onRestart: () => void }) {
  const result = useTyping((s) => s.result);
  const pb = useTyping((s) => s.personalBest);
  if (!result) return null;

  const isPB = pb && pb.mode === result.mode && pb.amount === result.amount && pb.wpm === result.wpm;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-8">
        <div className="col-span-2 md:col-span-1">
          <Stat label="wpm" value={result.wpm} sub={isPB ? "new personal best" : undefined} />
        </div>
        <Stat label="acc" value={`${result.accuracy}%`} />
        <Stat label="raw" value={result.raw} />
        <Stat label="consistency" value={`${result.consistency}%`} />
        <Stat label="errors" value={result.errors} />
        <Stat label="time" value={`${result.durationSec}s`} />
      </div>

      <div className="glass rounded-xl p-4 md:p-6 mb-6">
        <WpmChart samples={result.samples} />
        <div className="flex items-center gap-6 mt-2 text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-2"><span className="inline-block w-3 h-[2px] bg-primary" /> wpm</span>
          <span className="flex items-center gap-2"><span className="inline-block w-3 h-[2px] bg-muted-foreground/60" /> raw</span>
        </div>
      </div>

      <div className="flex items-center justify-between font-mono text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-4">
          <span>characters <span className="text-foreground">{result.correctChars}/{result.incorrectChars}/{result.extraChars}/{result.missedChars}</span></span>
          <span>mode <span className="text-foreground">{result.mode} {result.amount}</span></span>
          {result.punctuation && <span className="text-foreground">punctuation</span>}
          {result.numbers && <span className="text-foreground">numbers</span>}
        </div>
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition glow-primary"
        >
          <RotateCcw className="w-4 h-4" /> retry — <kbd className="font-mono">Tab</kbd>
        </button>
      </div>
    </motion.div>
  );
}
