import { useMemo } from "react";
import type { Sample } from "@/lib/typing-store";

export function WpmChart({ samples, height = 180 }: { samples: Sample[]; height?: number }) {
  const path = useMemo(() => {
    if (samples.length < 2) return { wpm: "", raw: "", maxY: 100, points: [] as Array<{ x: number; y: number; v: number }> };
    const maxT = samples[samples.length - 1].t || 1;
    const maxY = Math.max(60, ...samples.map((s) => Math.max(s.raw, s.wpm)));
    const W = 800;
    const H = height;
    const px = (t: number) => (t / maxT) * (W - 20) + 10;
    const py = (v: number) => H - 20 - (v / maxY) * (H - 30);

    const build = (key: "wpm" | "raw") =>
      samples
        .map((s, i) => `${i === 0 ? "M" : "L"}${px(s.t).toFixed(1)},${py(s[key]).toFixed(1)}`)
        .join(" ");

    return {
      wpm: build("wpm"),
      raw: build("raw"),
      maxY,
      points: samples.map((s) => ({ x: px(s.t), y: py(s.wpm), v: s.wpm })),
    };
  }, [samples, height]);

  return (
    <svg viewBox={`0 0 800 ${height}`} className="w-full h-auto">
      {/* grid */}
      {[0.25, 0.5, 0.75].map((p) => (
        <line key={p} x1={0} x2={800} y1={height - 20 - (height - 30) * p} y2={height - 20 - (height - 30) * p}
              stroke="currentColor" className="text-border" strokeDasharray="2 4" />
      ))}
      <path d={path.raw} fill="none" stroke="currentColor" className="text-muted-foreground/60" strokeWidth={1.5} />
      <path d={path.wpm} fill="none" stroke="currentColor" className="text-primary" strokeWidth={2.5} />
    </svg>
  );
}
