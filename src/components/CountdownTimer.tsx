import { useEffect, useState } from "react";

interface Time {
  h: number;
  m: number;
  s: number;
}

interface Props {
  initial?: Time;
}

export default function CountdownTimer({ initial = { h: 2, m: 47, s: 33 } }: Props) {
  const [time, setTime] = useState<Time>(initial);

  useEffect(() => {
    const id = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;

        // Se já chegou a zero, não continua
        if (h === 0 && m === 0 && s === 0) {
          clearInterval(id);
          return prev;
        }

        s--;

        if (s < 0) {
          s = 59;
          m--;
        }

        if (m < 0) {
          m = 59;
          h--;
        }

        if (h < 0) {
          return { h: 0, m: 0, s: 0 };
        }

        return { h, m, s };
      });
    }, 1000);

    return () => clearInterval(id);
  }, [initial]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {[time.h, time.m, time.s].map((v, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: 8,
              padding: "4px 8px",
              fontWeight: 700,
              fontSize: 18,
              color: "#4c1d95",
              fontFamily: "monospace",
              minWidth: 38,
              textAlign: "center",
            }}
          >
            {pad(v)}
          </div>

          {i < 2 && (
            <span style={{ color: "#8b5cf6", fontWeight: 800, fontSize: 16 }}>
              :
            </span>
          )}
        </span>
      ))}
    </div>
  );
}