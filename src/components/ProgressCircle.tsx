
import { useEffect, useState } from "react";
import { useTheme } from "../hooks/useApp";

interface ProgressCircleProps {
  pct?: number;
  label?: string;
  sublabel?: string;
}

export default function ProgressCircle({
  pct = 78,
  label,
  sublabel = "RANKING",
}: ProgressCircleProps) {
  const theme = useTheme();
  const r = 52;
  const circ = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    setAnimated(0);
    let start: number | null = null;
    const duration = 1400;

    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimated(Math.round(ease * pct));
      if (progress < 1) requestAnimationFrame(step);
    };

    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  const offset = circ - (animated / 100) * circ;

  return (
    <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(139,92,246,0.18) 0%,transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      <svg width={140} height={140} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={70}
          cy={70}
          r={r}
          fill="none"
          stroke="rgba(139,92,246,0.12)"
          strokeWidth={10}
        />
        <circle
          cx={70}
          cy={70}
          r={r}
          fill="none"
          stroke="url(#pg)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
        <defs>
          <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: theme.textPrimary,
            lineHeight: 1,
            fontFamily: "inherit",
          }}
        >
          {label ?? `${animated}%`}
        </span>
        <span
          style={{
            fontSize: 11,
            color: theme.textSecondary,
            letterSpacing: "0.06em",
            marginTop: 2,
          }}
        >
          {sublabel}
        </span>
      </div>
    </div>
  );
}
