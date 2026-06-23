import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    const cards = [
        {
            label: "P2P Transfer",
            sublabel: "Send to contacts",
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" />
                    <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
                </svg>
            ),
            route: "/p2p",
            accent: "#7C3AED",
            glow: "rgba(124,58,237,0.35)",
        },
        {
            label: "P2M Payment",
            sublabel: "Pay merchants",
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                </svg>
            ),
            route: "/p2m",
            accent: "#059669",
            glow: "rgba(5,150,105,0.35)",
        },
        {
            label: "Recharge",
            sublabel: "Mobile & DTH",
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <path d="M12 18h.01" />
                    <path d="M9 6l3-3 3 3" />
                </svg>
            ),
            route: "/recharge",
            accent: "#D97706",
            glow: "rgba(217,119,6,0.35)",
        },
        {
            label: "Balance",
            sublabel: "View wallet",
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                </svg>
            ),
            route: null,
            accent: "#3B82F6",
            glow: "rgba(59,130,246,0.35)",
        },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
 
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
        body {
          background: #07070D;
          min-height: 100vh;
        }
 
        .ph-root {
          min-height: 100vh;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 40% at 80% 90%, rgba(59,130,246,0.1) 0%, transparent 60%),
                      #07070D;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 1rem 3rem;
        }
 
        /* ── NAV ── */
        .ph-nav {
          width: 100%;
          max-width: 900px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 3.5rem;
        }
 
        .ph-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
 
        .ph-brand-logo {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #7C3AED, #3B82F6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          color: #fff;
          letter-spacing: -0.5px;
          box-shadow: 0 0 18px rgba(124,58,237,0.5);
        }
 
        .ph-brand-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 1.15rem;
          color: #fff;
          letter-spacing: -0.3px;
        }
 
        .ph-nav-chip {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          padding: 0.35rem 0.9rem;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.55);
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.3px;
        }
 
        /* ── HERO ── */
        .ph-hero {
          text-align: center;
          margin-bottom: 3rem;
        }
 
        .ph-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(124,58,237,0.12);
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 999px;
          padding: 0.3rem 0.85rem;
          font-size: 0.72rem;
          font-weight: 500;
          color: #A78BFA;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 1.2rem;
        }
 
        .ph-eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #7C3AED;
          animation: pulse-dot 2s infinite;
        }
 
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
 
        .ph-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2rem, 5vw, 2.8rem);
          font-weight: 700;
          color: #fff;
          letter-spacing: -1px;
          line-height: 1.1;
          margin-bottom: 0.7rem;
        }
 
        .ph-title-accent {
          background: linear-gradient(90deg, #7C3AED, #60A5FA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
 
        .ph-subtitle {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
          max-width: 360px;
          margin: 0 auto;
          line-height: 1.6;
        }
 
        /* ── BALANCE STRIP ── */
        .ph-balance-strip {
          background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.1));
          border: 1px solid rgba(124,58,237,0.25);
          border-radius: 16px;
          padding: 1.1rem 1.8rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 900px;
          margin-bottom: 2.2rem;
          backdrop-filter: blur(10px);
        }
 
        .ph-bal-left {
          display: flex;
          flex-direction: column;
        }
 
        .ph-bal-label {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 0.2rem;
        }
 
        .ph-bal-amount {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
        }
 
        .ph-bal-amount span {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
          margin-right: 3px;
        }
 
        .ph-bal-badge {
          background: rgba(5,150,105,0.15);
          border: 1px solid rgba(5,150,105,0.3);
          color: #34D399;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.25rem 0.7rem;
          border-radius: 999px;
        }
 
        /* ── CARDS GRID ── */
        .ph-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          width: 100%;
          max-width: 900px;
        }
 
        @media (min-width: 600px) {
          .ph-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
 
        .ph-card {
          position: relative;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 1.6rem 1.2rem 1.4rem;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          text-align: left;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          background-clip: padding-box;
        }
 
        .ph-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: radial-gradient(circle at 70% 20%, var(--card-glow), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
 
        .ph-card:hover {
          transform: translateY(-4px);
          border-color: var(--card-accent);
          box-shadow: 0 8px 32px var(--card-glow), 0 0 0 1px var(--card-accent);
        }
 
        .ph-card:hover::before {
          opacity: 1;
        }
 
        .ph-card:active {
          transform: translateY(-1px);
        }
 
        .ph-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          background: var(--card-accent);
          box-shadow: 0 4px 16px var(--card-glow);
          flex-shrink: 0;
        }
 
        .ph-card-text {}
 
        .ph-card-label {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 0.2rem;
        }
 
        .ph-card-sublabel {
          font-size: 0.73rem;
          color: rgba(255,255,255,0.38);
          font-weight: 400;
        }
 
        .ph-card-arrow {
          position: absolute;
          bottom: 1.1rem;
          right: 1.1rem;
          color: rgba(255,255,255,0.2);
          transition: color 0.2s, transform 0.2s;
        }
 
        .ph-card:hover .ph-card-arrow {
          color: var(--card-accent);
          transform: translate(2px, -2px);
        }
 
        /* ── FOOTER ── */
        .ph-footer {
          margin-top: 3rem;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.18);
          letter-spacing: 0.3px;
        }
      `}</style>

            <div className="ph-root">
                {/* NAV */}
                <nav className="ph-nav">
                    <div className="ph-brand">
                        <div className="ph-brand-logo">Pe</div>
                        <span className="ph-brand-name">SwiftPe</span>
                    </div>
                    <span className="ph-nav-chip">v1.0 · Demo</span>
                </nav>

                {/* HERO */}
                <div className="ph-hero">
                    <div className="ph-eyebrow">
                        <span className="ph-eyebrow-dot" />
                        UPI Payments
                    </div>
                    <h1 className="ph-title">
                        Money moves<br />
                        <span className="ph-title-accent">at your speed</span>
                    </h1>
                    <p className="ph-subtitle">Fast, secure, and instant payments — wherever you are.</p>
                </div>

                {/* BALANCE STRIP */}
                <div className="ph-balance-strip">
                    <div className="ph-bal-left">
                        <span className="ph-bal-label">Wallet Balance</span>
                        <span className="ph-bal-amount"><span>₹</span>12,450.00</span>
                    </div>
                    <span className="ph-bal-badge">● Active</span>
                </div>

                {/* CARDS */}
                <div className="ph-grid">
                    {cards.map((c) => (
                        <button
                            key={c.label}
                            className="ph-card"
                            style={{ "--card-accent": c.accent, "--card-glow": c.glow }}
                            onClick={() => c.route && navigate(c.route)}
                        >
                            <div className="ph-card-icon">{c.icon}</div>
                            <div className="ph-card-text">
                                <div className="ph-card-label">{c.label}</div>
                                <div className="ph-card-sublabel">{c.sublabel}</div>
                            </div>
                            <span className="ph-card-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </span>
                        </button>
                    ))}
                </div>

                <p className="ph-footer">© 2024 SwiftPe · Secured by UPI</p>
            </div>
        </>
    );
}

export default Home;