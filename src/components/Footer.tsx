import { useTheme } from "../hooks/useApp";

export default function Footer() {
  const theme = useTheme();

  return (
    <footer
      style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 40%, #3b82f6 100%)",
        width: "100%",
        margin: "48px 0 0",
        padding: "32px 40px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative overlay matching logo style */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(167,139,250,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(96,165,250,0.1) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Top section - brand + links */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 24,
            marginBottom: 24,
          }}
        >
          {/* Brand */}
          <div>
            <span
              style={{
                fontWeight: 800,
                fontSize: 22,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              Palhetta
            </span>
            <span
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.15em",
                marginTop: 2,
              }}
            >
              MARKETPLACE
            </span>
          </div>

          {/* Contact links */}
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {/* Email */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Contato
              </div>
              <a
                href="mailto:Palhetapedro11@gmail.com"
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 15 }}>✉</span>
                Palhetapedro11@gmail.com
              </a>
            </div>

            {/* Social */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Redes Sociais
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {/* GitHub Link  */}
                <a
                  href="https://github.com/Palhetaspedro"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 15 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </span>
                  GitHub
                </a>
                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/pedro-palheta-b81017321/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 15 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </span>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.15)",
            marginBottom: 16,
          }}
        />

        {/* Copyright Palhetaspedro */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            &copy; {new Date().getFullYear()} Direitos autorais por{" "}
            <span style={{ color: "#fff", fontWeight: 600 }}>
              @Palhetaspedro
            </span>
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            Todos os direitos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
}