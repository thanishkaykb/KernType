import { useEffect } from "react";
import { useTyping } from "@/lib/typing-store";
import { Keyboard, Moon, Sun, Monitor } from "lucide-react";

function applyTheme(t: "dark" | "light" | "system") {
  const root = document.documentElement;
  const resolved = t === "system"
    ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
    : t;
  root.classList.remove("dark", "light");
  root.classList.add(resolved);
}

export function Navbar() {
  const theme = useTyping((s) => s.theme);
  const setSettings = useTyping((s) => s.setSettings);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const cycle = () => {
    const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    setSettings({ theme: next });
  };

  return (
    <header className="w-full max-w-[1100px] mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
      <div className="flex items-end gap-2 select-none">
        <div className="w-9 h-9 rounded-md border border-primary/60 grid place-items-center text-primary">
          <Keyboard className="w-4 h-4" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[10px] font-mono text-muted-foreground -mb-0.5 ml-0.5">type smooth</span>
          <span className="font-mono text-2xl tracking-tight text-foreground/90">
            kern<span className="text-primary">type</span>
          </span>
        </div>
      </div>
      <nav className="flex items-center gap-1 font-mono text-sm text-muted-foreground">
        <button onClick={cycle} className="h-8 w-8 grid place-items-center rounded-md hover:text-foreground transition" title={`Theme: ${theme}`}>
          {theme === "dark" ? <Moon className="w-4 h-4" /> : theme === "light" ? <Sun className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
        </button>
      </nav>
    </header>
  );
}
