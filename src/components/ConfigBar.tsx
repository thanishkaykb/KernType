import { useTyping, type Mode } from "@/lib/typing-store";
import { AtSign, Hash, Eye, EyeOff, Sparkles, Clock, Type } from "lucide-react";

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [10, 25, 50, 100];

function Pill({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-3 h-8 rounded-md text-sm font-mono transition-all duration-150 ${
        active
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function ConfigBar() {
  const mode = useTyping((s) => s.mode);
  const timeAmount = useTyping((s) => s.timeAmount);
  const wordsAmount = useTyping((s) => s.wordsAmount);
  const punctuation = useTyping((s) => s.punctuation);
  const numbers = useTyping((s) => s.numbers);
  const blind = useTyping((s) => s.blindMode);
  const zen = useTyping((s) => s.zenMode);
  const setSettings = useTyping((s) => s.setSettings);
  const startedAt = useTyping((s) => s.startedAt);
  const finishedAt = useTyping((s) => s.finishedAt);

  // Hide during active session for distraction-free typing
  if (startedAt && !finishedAt) return <div className="h-10" />;

  return (
    <div className="glass rounded-full px-3 py-2 inline-flex items-center gap-1 flex-wrap justify-center mx-auto">
      <Pill active={punctuation} onClick={() => setSettings({ punctuation: !punctuation })} title="Punctuation">
        <AtSign className="inline w-3.5 h-3.5 mr-1" />punctuation
      </Pill>
      <Pill active={numbers} onClick={() => setSettings({ numbers: !numbers })} title="Numbers">
        <Hash className="inline w-3.5 h-3.5 mr-1" />numbers
      </Pill>
      <div className="w-px h-5 bg-border mx-1" />
      <Pill active={mode === "time"} onClick={() => setSettings({ mode: "time" as Mode })}>
        <Clock className="inline w-3.5 h-3.5 mr-1" />time
      </Pill>
      <Pill active={mode === "words"} onClick={() => setSettings({ mode: "words" as Mode })}>
        <Type className="inline w-3.5 h-3.5 mr-1" />words
      </Pill>
      <div className="w-px h-5 bg-border mx-1" />
      {mode === "time"
        ? TIME_OPTIONS.map((n) => (
            <Pill key={n} active={timeAmount === n} onClick={() => setSettings({ timeAmount: n })}>{n}</Pill>
          ))
        : WORD_OPTIONS.map((n) => (
            <Pill key={n} active={wordsAmount === n} onClick={() => setSettings({ wordsAmount: n })}>{n}</Pill>
          ))}
      <div className="w-px h-5 bg-border mx-1" />
      <Pill active={blind} onClick={() => setSettings({ blindMode: !blind })} title="Blind mode">
        {blind ? <EyeOff className="inline w-3.5 h-3.5" /> : <Eye className="inline w-3.5 h-3.5" />}
      </Pill>
      <Pill active={zen} onClick={() => setSettings({ zenMode: !zen })} title="Zen mode">
        <Sparkles className="inline w-3.5 h-3.5" />
      </Pill>
    </div>
  );
}
