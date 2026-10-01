import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getRechargeBase } from "../services/api";

const OPERATORS = [
    {
        id: "jio",
        label: "Jio",
        color: "#3B82F6",
        glow: "rgba(59,130,246,0.3)",
        bg: "rgba(59,130,246,0.1)",
        border: "rgba(59,130,246,0.28)",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 6l11 6 11-6"/><path d="M1 12l11 6 11-6"/><path d="M1 18l11 6 11-6"/>
            </svg>
        ),
    },
    {
        id: "airtel",
        label: "Airtel",
        color: "#EF4444",
        glow: "rgba(239,68,68,0.3)",
        bg: "rgba(239,68,68,0.1)",
        border: "rgba(239,68,68,0.28)",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1.5 8.5C5 4 10 2 12 2s7 2 10.5 6.5"/><path d="M5 12c1.8-2.5 4.2-4 7-4s5.2 1.5 7 4"/>
                <path d="M8.5 15.5C9.8 14 11 13 12 13s2.2 1 3.5 2.5"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/>
            </svg>
        ),
    },
    {
        id: "vi",
        label: "Vi",
        color: "#D97706",
        glow: "rgba(217,119,6,0.3)",
        bg: "rgba(217,119,6,0.1)",
        border: "rgba(217,119,6,0.28)",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 2 13 13 9 9 2 16"/><polyline points="16 2 22 2 22 8"/>
            </svg>
        ),
    },
];

const QUICK_AMOUNTS = [49, 99, 199, 299, 499];

function Recharge() {
    const navigate = useNavigate();
    const [operator, setOperator] = useState("");
    const [mobile, setMobile] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cooldown, setCooldown] = useState(false);
    const lastRequestTime = useRef(0);

    const selectedOp = OPERATORS.find((o) => o.id === operator);

    const recharge = async () => {
        setError(null);
        const now = Date.now();
        if (now - lastRequestTime.current < 5000) {
            setError("Please wait 5 seconds before trying again.");
            return;
        }
        lastRequestTime.current = now;
        setCooldown(true);
        setTimeout(() => setCooldown(false), 5000);

        setLoading(true);
        try {
            const base = getRechargeBase();
            await axios.post(`${base}/recharge/do`, {
                mobileNumber: mobile,
                operator,
                amount: Number(amount),
            });
            setSuccess(true);
        } catch (err) {
            setError("Recharge failed. Please check your details and try again.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setSuccess(false);
        setError(null);
        setOperator("");
        setMobile("");
        setAmount("");
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07070D; min-height: 100vh; }

        .rc-root {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(217,119,6,0.13) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 85% 85%, rgba(124,58,237,0.1) 0%, transparent 60%),
            #07070D;
          font-family: 'Inter', sans-serif;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 1.5rem;
        }

        /* ── NAV ── */
        .rc-nav {
          width: 100%; max-width: 460px;
          display: flex; align-items: center; gap: 0.8rem;
          margin-bottom: 2rem;
        }
        .rc-back {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5); cursor: pointer;
          transition: background 0.2s, color 0.2s; flex-shrink: 0;
        }
        .rc-back:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .rc-nav-logo {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #7C3AED, #3B82F6);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; font-size: 0.75rem; color: #fff;
          box-shadow: 0 0 12px rgba(124,58,237,0.4);
        }
        .rc-nav-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600; font-size: 0.9rem; color: rgba(255,255,255,0.6);
        }
        .rc-nav-sep { color: rgba(255,255,255,0.2); font-size: 0.85rem; }
        .rc-nav-page {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600; font-size: 0.9rem; color: #fff;
        }

        /* ── CARD ── */
        .rc-card {
          width: 100%; max-width: 460px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px; padding: 2.4rem 2.2rem;
          backdrop-filter: blur(12px);
        }

        /* ── HEADER ── */
        .rc-header {
          display: flex; align-items: center; gap: 1rem;
          margin-bottom: 2rem;
        }
        .rc-header-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: rgba(217,119,6,0.12);
          border: 1px solid rgba(217,119,6,0.28);
          display: flex; align-items: center; justify-content: center;
          color: #FCD34D;
          box-shadow: 0 4px 16px rgba(217,119,6,0.2);
          flex-shrink: 0;
        }
        .rc-header-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.25rem; font-weight: 700; color: #fff;
          letter-spacing: -0.3px; margin-bottom: 0.15rem;
        }
        .rc-header-sub { font-size: 0.78rem; color: rgba(255,255,255,0.35); }

        .rc-divider { height: 1px; background: rgba(255,255,255,0.07); margin-bottom: 1.8rem; }

        /* ── OPERATOR SECTION ── */
        .rc-section-label {
          font-size: 0.73rem; font-weight: 500;
          color: rgba(255,255,255,0.38); text-transform: uppercase;
          letter-spacing: 0.7px; margin-bottom: 0.75rem;
        }

        .rc-operators {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0.65rem; margin-bottom: 1.5rem;
        }

        .rc-op-btn {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 0.9rem 0.5rem 0.75rem;
          display: flex; flex-direction: column;
          align-items: center; gap: 0.45rem;
          cursor: pointer;
          transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s, background 0.18s;
          outline: none;
        }
        .rc-op-btn:hover {
          transform: translateY(-2px);
        }
        .rc-op-btn.selected {
          border-color: var(--op-color);
          background: var(--op-bg);
          box-shadow: 0 4px 18px var(--op-glow);
        }
        .rc-op-icon {
          width: 34px; height: 34px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.06);
          transition: color 0.18s, background 0.18s;
        }
        .rc-op-btn.selected .rc-op-icon {
          color: var(--op-color);
          background: var(--op-bg);
        }
        .rc-op-label {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.82rem; font-weight: 600;
          color: rgba(255,255,255,0.45);
          transition: color 0.18s;
        }
        .rc-op-btn.selected .rc-op-label { color: #fff; }
        .rc-op-check {
          position: absolute; top: 6px; right: 6px;
          width: 16px; height: 16px; border-radius: 50%;
          background: var(--op-color);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: scale(0.5);
          transition: opacity 0.18s, transform 0.18s;
        }
        .rc-op-btn.selected .rc-op-check { opacity: 1; transform: scale(1); }

        /* ── FIELD ── */
        .rc-field { margin-bottom: 1rem; }
        .rc-label {
          display: block; font-size: 0.73rem; font-weight: 500;
          color: rgba(255,255,255,0.38); text-transform: uppercase;
          letter-spacing: 0.7px; margin-bottom: 0.45rem;
        }
        .rc-input-wrap { position: relative; }
        .rc-input-icon {
          position: absolute; left: 1rem; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.22);
          display: flex; align-items: center; pointer-events: none;
        }
        .rc-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 0.82rem 1rem 0.82rem 2.8rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem; color: #fff; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -webkit-appearance: none;
        }
        .rc-input::placeholder { color: rgba(255,255,255,0.18); }
        .rc-input:focus {
          border-color: #D97706;
          background: rgba(217,119,6,0.07);
          box-shadow: 0 0 0 3px rgba(217,119,6,0.15);
        }
        .rc-amount-prefix {
          position: absolute; left: 1rem; top: 50%;
          transform: translateY(-50%);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem; font-weight: 600;
          color: rgba(255,255,255,0.3); pointer-events: none;
        }
        .rc-input-amount {
          padding-left: 2rem;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.1rem; font-weight: 600; letter-spacing: -0.3px;
        }

        /* ── QUICK AMOUNTS ── */
        .rc-quick {
          display: flex; flex-wrap: wrap; gap: 0.5rem;
          margin-top: 0.6rem;
        }
        .rc-quick-chip {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 999px; padding: 0.3rem 0.75rem;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.78rem; font-weight: 600;
          color: rgba(255,255,255,0.4); cursor: pointer;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
        }
        .rc-quick-chip:hover,
        .rc-quick-chip.active {
          background: rgba(217,119,6,0.12);
          border-color: rgba(217,119,6,0.35);
          color: #FCD34D;
        }

        /* ── COOLDOWN BAR ── */
        .rc-cooldown {
          margin-top: 0.8rem;
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.75rem; color: rgba(255,255,255,0.3);
        }
        .rc-cooldown-bar {
          flex: 1; height: 3px; border-radius: 999px;
          background: rgba(255,255,255,0.08); overflow: hidden;
        }
        .rc-cooldown-fill {
          height: 100%; border-radius: 999px;
          background: linear-gradient(90deg, #D97706, #F59E0B);
          animation: cooldown-drain 5s linear forwards;
        }
        @keyframes cooldown-drain {
          from { width: 100%; }
          to   { width: 0%; }
        }

        /* ── RECHARGE BTN ── */
        .rc-btn {
          width: 100%; margin-top: 1.6rem;
          background: linear-gradient(135deg, #D97706, #B45309);
          border: none; border-radius: 12px; padding: 0.95rem;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.95rem; font-weight: 600; color: #fff;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s, filter 0.18s;
          box-shadow: 0 4px 20px rgba(217,119,6,0.35);
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          outline: none;
        }
        .rc-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(217,119,6,0.5);
          filter: brightness(1.08);
        }
        .rc-btn:active:not(:disabled) { transform: translateY(0); }
        .rc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .rc-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── ERROR ── */
        .rc-error {
          margin-top: 1rem;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 12px; padding: 0.85rem 1rem;
          display: flex; align-items: flex-start; gap: 0.6rem;
          color: #FCA5A5; font-size: 0.82rem; line-height: 1.5;
        }
        .rc-error-icon { flex-shrink: 0; margin-top: 1px; }

        /* ── SUCCESS ── */
        .rc-success {
          margin-top: 1.4rem;
          background: rgba(217,119,6,0.08);
          border: 1px solid rgba(217,119,6,0.22);
          border-radius: 16px; padding: 1.6rem 1.2rem;
          text-align: center;
        }
        .rc-success-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(217,119,6,0.12);
          border: 2px solid rgba(217,119,6,0.3);
          display: flex; align-items: center; justify-content: center;
          color: #FCD34D; margin: 0 auto 1rem;
          box-shadow: 0 0 24px rgba(217,119,6,0.25);
        }
        .rc-success-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem; font-weight: 700; color: #fff;
          margin-bottom: 0.3rem;
        }
        .rc-success-sub { font-size: 0.8rem; color: rgba(255,255,255,0.35); margin-bottom: 1.2rem; }
        .rc-success-rows { display: flex; flex-direction: column; gap: 0.65rem; text-align: left; margin-bottom: 1.2rem; }
        .rc-success-row { display: flex; justify-content: space-between; }
        .rc-success-key { font-size: 0.78rem; color: rgba(255,255,255,0.35); }
        .rc-success-val {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.85rem; font-weight: 600; color: #fff;
        }
        .rc-success-val.amber { color: #FCD34D; }
        .rc-again-btn {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 0.7rem;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.82rem; font-weight: 500;
          color: rgba(255,255,255,0.4); cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .rc-again-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); }

        .rc-footer {
          margin-top: 1.6rem;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          font-size: 0.72rem; color: rgba(255,255,255,0.18);
        }
      `}</style>

            <div className="rc-root">

                {/* NAV */}
                <div className="rc-nav">
                    <button className="rc-back" onClick={() => navigate("/home")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                    </button>
                    <div className="rc-nav-logo">Pe</div>
                    <span className="rc-nav-name">SwiftPe</span>
                    <span className="rc-nav-sep">/</span>
                    <span className="rc-nav-page">Recharge</span>
                </div>

                {/* CARD */}
                <div className="rc-card">

                    {/* HEADER */}
                    <div className="rc-header">
                        <div className="rc-header-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="2" width="14" height="20" rx="2" />
                                <path d="M12 18h.01" /><path d="M9 6l3-3 3 3" />
                            </svg>
                        </div>
                        <div>
                            <div className="rc-header-title">Mobile Recharge</div>
                            <div className="rc-header-sub">Prepaid top-up via load balancer</div>
                        </div>
                    </div>

                    <div className="rc-divider" />

                    {/* OPERATOR SELECT */}
                    <div className="rc-section-label">Select Operator</div>
                    <div className="rc-operators">
                        {OPERATORS.map((op) => (
                            <button
                                key={op.id}
                                className={`rc-op-btn${operator === op.id ? " selected" : ""}`}
                                style={{ "--op-color": op.color, "--op-glow": op.glow, "--op-bg": op.bg, "--op-border": op.border }}
                                onClick={() => setOperator(op.id)}
                            >
                                <div className="rc-op-check">
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div className="rc-op-icon">{op.icon}</div>
                                <span className="rc-op-label">{op.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* MOBILE */}
                    <div className="rc-field">
                        <label className="rc-label">Mobile Number</label>
                        <div className="rc-input-wrap">
              <span className="rc-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.8 19.8 0 01.1 2.22 2 2 0 012.1 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </span>
                            <input className="rc-input" placeholder="+91 98765 43210"
                                   type="tel" maxLength={10} value={mobile}
                                   onChange={(e) => setMobile(e.target.value)} />
                        </div>
                    </div>

                    {/* AMOUNT */}
                    <div className="rc-field">
                        <label className="rc-label">Amount</label>
                        <div className="rc-input-wrap">
                            <span className="rc-amount-prefix">₹</span>
                            <input className="rc-input rc-input-amount" placeholder="0.00"
                                   type="number" value={amount}
                                   onChange={(e) => setAmount(e.target.value)} />
                        </div>
                        <div className="rc-quick">
                            {QUICK_AMOUNTS.map((q) => (
                                <button
                                    key={q}
                                    className={`rc-quick-chip${Number(amount) === q ? " active" : ""}`}
                                    onClick={() => setAmount(String(q))}
                                >
                                    ₹{q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* COOLDOWN BAR */}
                    {cooldown && (
                        <div className="rc-cooldown">
                            <span>Rate limit</span>
                            <div className="rc-cooldown-bar">
                                <div className="rc-cooldown-fill" />
                            </div>
                            <span>5s</span>
                        </div>
                    )}

                    {/* ERROR */}
                    {error && (
                        <div className="rc-error">
              <span className="rc-error-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </span>
                            {error}
                        </div>
                    )}

                    {/* RECHARGE BTN */}
                    {!success && (
                        <button className="rc-btn" onClick={recharge}
                                disabled={loading || !operator || !mobile || !amount}>
                            {loading ? (
                                <><div className="rc-spinner" /> Processing...</>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" />
                                    </svg>
                                    Recharge {operator ? `(${OPERATORS.find(o => o.id === operator)?.label})` : ""} {amount ? `₹${amount}` : ""}
                                </>
                            )}
                        </button>
                    )}

                    {/* SUCCESS */}
                    {success && (
                        <div className="rc-success">
                            <div className="rc-success-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div className="rc-success-title">Recharge Successful!</div>
                            <div className="rc-success-sub">Your number has been topped up</div>
                            <div className="rc-success-rows">
                                <div className="rc-success-row">
                                    <span className="rc-success-key">Mobile</span>
                                    <span className="rc-success-val">{mobile}</span>
                                </div>
                                <div className="rc-success-row">
                                    <span className="rc-success-key">Operator</span>
                                    <span className="rc-success-val">{OPERATORS.find(o => o.id === operator)?.label}</span>
                                </div>
                                <div className="rc-success-row">
                                    <span className="rc-success-key">Amount</span>
                                    <span className="rc-success-val amber">₹{amount}</span>
                                </div>
                            </div>
                            <button className="rc-again-btn" onClick={reset}>Recharge another number</button>
                        </div>
                    )}

                </div>

                {/* FOOTER */}
                <div className="rc-footer">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    256-bit SSL encrypted · Secured by UPI
                </div>

            </div>
        </>
    );
}

export default Recharge;