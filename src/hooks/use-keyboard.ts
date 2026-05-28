import { useEffect } from "react";
import { useTyping } from "@/lib/typing-store";

export function useKeyboard(onRestart: () => void) {
  const typeChar = useTyping((s) => s.typeChar);
  const pushSpace = useTyping((s) => s.pushSpace);
  const backspace = useTyping((s) => s.backspace);
  const finishedAt = useTyping((s) => s.finishedAt);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Allow restart even when finished
      if (e.key === "Tab" || (e.key === "Escape" && finishedAt)) {
        e.preventDefault();
        onRestart();
        return;
      }
      // Ignore when typing in form fields
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement | null)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (finishedAt) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        backspace(false);
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        pushSpace();
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        typeChar(e.key);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [typeChar, pushSpace, backspace, onRestart, finishedAt]);
}
