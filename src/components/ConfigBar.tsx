import { useTyping, type Mode } from "@/lib/typing-store";
import { AtSign, Hash, Eye, EyeOff, Sparkles, Clock, Type, Quote } from "lucide-react";

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [10, 25, 50, 100];
const QUOTE_OPTIONS = [10, 15, 20, 25, 30];

function Pill({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-2.5 h-7 rounded text-[13px] font-mono inline-flex items-center gap-1.5 transition-colors duration-150 ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-border/80 mx-1.5" />;
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
  if (startedAt && !finishedAt) return <div className="h-9" />;

  return (
    <div className="bg-card/60 rounded-md px-3 py-1.5 inline-flex items-center flex-wrap justify-center mx-auto transition-opacity">
      <Pill active={punctuation} onClick={() => setSettings({ punctuation: !punctuation })} title="Punctuation">
        <AtSign className="w-3.5 h-3.5" />punctuation
      </Pill>
      <Pill active={numbers} onClick={() => setSettings({ numbers: !numbers })} title="Numbers">
        <Hash className="w-3.5 h-3.5" />numbers
      </Pill>
      <Divider />
      <Pill active={mode === "time"} onClick={() => setSettings({ mode: "time" as Mode })}>
        <Clock className="w-3.5 h-3.5" />time
      </Pill>
      <Pill active={mode === "words"} onClick={() => setSettings({ mode: "words" as Mode })}>
        <Type className="w-3.5 h-3.5" />words
      </Pill>
      <Pill active={zen} onClick={() => setSettings({ zenMode: !zen })} title="Zen mode">
        <Quote className="w-3.5 h-3.5" />zen
      </Pill>
      <Divider />
      {mode === "time"
        ? TIME_OPTIONS.map((n) => (
            <Pill key={n} active={timeAmount === n} onClick={() => setSettings({ timeAmount: n })}>
              {n}
            </Pill>
          ))
        : WORD_OPTIONS.map((n) => (
            <Pill key={n} active={wordsAmount === n} onClick={() => setSettings({ wordsAmount: n })}>
              {n}
            </Pill>
          ))}
      <Divider />
      <Pill active={blind} onClick={() => setSettings({ blindMode: !blind })} title="Blind mode">
        {blind ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </Pill>
      <Pill active={false} onClick={() => {}} title="More">
        <Sparkles className="w-3.5 h-3.5" />
      </Pill>
    </div>
  );
}
