import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getErrorMessage } from "../services/api";

function P2P() {
    const navigate = useNavigate();
    const [sender, setSender] = useState("");
    const [receiver, setReceiver] = useState("");
    const [amount, setAmount] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendMoney = async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await API.post("/p2p/sendMoney", {
                senderId: sender,
                receiverId: receiver,
                amount: Number(amount),
            });
            setResult(res.data);
        } catch (err) {
            setError(getErrorMessage(err, "Transaction failed. Please verify the details and try again."));
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError(null);
        setSender("");
        setReceiver("");
        setAmount("");
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07070D; min-height: 100vh; }

        .p2p-root {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.16) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 15% 90%, rgba(59,130,246,0.1) 0%, transparent 60%),
            #07070D;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        /* ── NAV ── */
        .p2p-nav {
          width: 100%; max-width: 460px;
          display: flex; align-items: center; gap: 0.8rem;
          margin-bottom: 2rem;
        }
        .p2p-back {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5); cursor: pointer;
          transition: background 0.2s, color 0.2s; flex-shrink: 0;
        }
        .p2p-back:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .p2p-nav-logo {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #7C3AED, #3B82F6);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; font-size: 0.75rem; color: #fff;
          box-shadow: 0 0 12px rgba(124,58,237,0.4);
        }
        .p2p-nav-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600; font-size: 0.9rem; color: rgba(255,255,255,0.6);
        }
        .p2p-nav-sep { color: rgba(255,255,255,0.2); font-size: 0.85rem; }
        .p2p-nav-page {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600; font-size: 0.9rem; color: #fff;
        }

        /* ── CARD ── */
        .p2p-card {
          width: 100%; max-width: 460px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 2.4rem 2.2rem;
          backdrop-filter: blur(12px);
        }

        /* ── HEADER ── */
        .p2p-header {
          display: flex; align-items: center; gap: 1rem;
          margin-bottom: 2rem;
        }
        .p2p-header-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: rgba(124,58,237,0.12);
          border: 1px solid rgba(124,58,237,0.28);
          display: flex; align-items: center; justify-content: center;
          color: #A78BFA;
          box-shadow: 0 4px 16px rgba(124,58,237,0.2);
          flex-shrink: 0;
        }
        .p2p-header-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.25rem; font-weight: 700; color: #fff;
          letter-spacing: -0.3px; margin-bottom: 0.15rem;
        }
        .p2p-header-sub {
          font-size: 0.78rem; color: rgba(255,255,255,0.35);
        }

        .p2p-divider {
          height: 1px; background: rgba(255,255,255,0.07);
          margin-bottom: 1.8rem;
        }

        /* ── TRANSFER VISUAL ── */
        .p2p-transfer-row {
          display: flex; align-items: center; gap: 0.6rem;
          margin-bottom: 1.6rem;
        }
        .p2p-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; font-size: 0.8rem;
          flex-shrink: 0;
        }
        .p2p-avatar-sender {
          background: rgba(124,58,237,0.18);
          border: 1.5px solid rgba(124,58,237,0.35);
          color: #A78BFA;
        }
        .p2p-avatar-receiver {
          background: rgba(59,130,246,0.15);
          border: 1.5px solid rgba(59,130,246,0.3);
          color: #60A5FA;
        }
        .p2p-avatar-label {
          font-size: 0.68rem; color: rgba(255,255,255,0.3);
          text-align: center; margin-top: 0.25rem;
          font-weight: 500;
        }
        .p2p-avatar-wrap { display: flex; flex-direction: column; align-items: center; }
        .p2p-arrow-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, rgba(124,58,237,0.4), rgba(59,130,246,0.4));
          position: relative;
        }
        .p2p-arrow-line::after {
          content: '';
          position: absolute; right: -1px; top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 6px solid rgba(59,130,246,0.5);
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
        }
        .p2p-arrow-amount {
          position: absolute; left: 50%; top: -20px;
          transform: translateX(-50%);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.75rem; font-weight: 600;
          color: rgba(255,255,255,0.5);
          white-space: nowrap;
          background: #07070D;
          padding: 0 0.4rem;
        }
        .p2p-arrow-wrap { flex: 1; position: relative; }

        /* ── FIELD ── */
        .p2p-field { margin-bottom: 1rem; }
        .p2p-label {
          display: block; font-size: 0.73rem; font-weight: 500;
          color: rgba(255,255,255,0.38); text-transform: uppercase;
          letter-spacing: 0.7px; margin-bottom: 0.45rem;
        }
        .p2p-input-wrap { position: relative; }
        .p2p-input-icon {
          position: absolute; left: 1rem; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.22);
          display: flex; align-items: center; pointer-events: none;
        }
        .p2p-input {
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
        .p2p-input::placeholder { color: rgba(255,255,255,0.18); }
        .p2p-input.sender:focus {
          border-color: #7C3AED;
          background: rgba(124,58,237,0.07);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
        }
        .p2p-input.receiver:focus {
          border-color: #3B82F6;
          background: rgba(59,130,246,0.07);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .p2p-input.amount-inp:focus {
          border-color: #7C3AED;
          background: rgba(124,58,237,0.07);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
        }
        .p2p-amount-prefix {
          position: absolute; left: 1rem; top: 50%;
          transform: translateY(-50%);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem; font-weight: 600;
          color: rgba(255,255,255,0.3); pointer-events: none;
        }
        .p2p-input-amount {
          padding-left: 2rem;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.1rem; font-weight: 600; letter-spacing: -0.3px;
        }

        /* ── SEND BTN ── */
        .p2p-btn {
          width: 100%; margin-top: 1.6rem;
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          border: none; border-radius: 12px; padding: 0.95rem;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.95rem; font-weight: 600; color: #fff;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s, filter 0.18s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.4);
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          outline: none;
        }
        .p2p-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(124,58,237,0.55);
          filter: brightness(1.08);
        }
        .p2p-btn:active:not(:disabled) { transform: translateY(0); }
        .p2p-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .p2p-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── ERROR ── */
        .p2p-error {
          margin-top: 1rem;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 12px; padding: 0.85rem 1rem;
          display: flex; align-items: flex-start; gap: 0.6rem;
          color: #FCA5A5; font-size: 0.82rem; line-height: 1.5;
        }
        .p2p-error-icon { flex-shrink: 0; margin-top: 1px; }

        /* ── RESULT ── */
        .p2p-result {
          margin-top: 1.4rem;
          background: rgba(124,58,237,0.07);
          border: 1px solid rgba(124,58,237,0.22);
          border-radius: 16px; padding: 1.4rem 1.2rem;
        }
        .p2p-result-badge {
          display: inline-flex; align-items: center; gap: 0.35rem;
          background: rgba(124,58,237,0.15);
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 999px; padding: 0.25rem 0.75rem;
          font-size: 0.75rem; font-weight: 600;
          color: #A78BFA; letter-spacing: 0.3px;
          margin-bottom: 1.2rem;
        }
        .p2p-result-rows { display: flex; flex-direction: column; gap: 0.75rem; }
        .p2p-result-row {
          display: flex; justify-content: space-between; align-items: center;
        }
        .p2p-result-key { font-size: 0.8rem; color: rgba(255,255,255,0.35); }
        .p2p-result-val {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.9rem; font-weight: 600; color: #fff;
        }
        .p2p-result-sep { height: 1px; background: rgba(255,255,255,0.06); margin: 0.25rem 0; }
        .p2p-result-total {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.1rem; font-weight: 700;
          background: linear-gradient(90deg, #A78BFA, #60A5FA);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .p2p-again-btn {
          width: 100%; margin-top: 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 0.7rem;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.82rem; font-weight: 500;
          color: rgba(255,255,255,0.4); cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .p2p-again-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); }

        .p2p-footer {
          margin-top: 1.6rem;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          font-size: 0.72rem; color: rgba(255,255,255,0.18);
        }
      `}</style>

            <div className="p2p-root">

                {/* NAV */}
                <div className="p2p-nav">
                    <button className="p2p-back" onClick={() => navigate("/home")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                    </button>
                    <div className="p2p-nav-logo">Pe</div>
                    <span className="p2p-nav-name">SwiftPe</span>
                    <span className="p2p-nav-sep">/</span>
                    <span className="p2p-nav-page">P2P Transfer</span>
                </div>

                {/* CARD */}
                <div className="p2p-card">

                    {/* HEADER */}
                    <div className="p2p-header">
                        <div className="p2p-header-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" />
                                <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
                            </svg>
                        </div>
                        <div>
                            <div className="p2p-header-title">Send Money</div>
                            <div className="p2p-header-sub">Instant peer-to-peer transfer</div>
                        </div>
                    </div>

                    {/* TRANSFER VISUAL */}
                    <div className="p2p-transfer-row">
                        <div className="p2p-avatar-wrap">
                            <div className="p2p-avatar p2p-avatar-sender">
                                {sender ? sender.slice(0, 2).toUpperCase() : "S"}
                            </div>
                            <div className="p2p-avatar-label">Sender</div>
                        </div>
                        <div className="p2p-arrow-wrap">
                            <div className="p2p-arrow-line">
                                {amount && (
                                    <span className="p2p-arrow-amount">₹{amount}</span>
                                )}
                            </div>
                        </div>
                        <div className="p2p-avatar-wrap">
                            <div className="p2p-avatar p2p-avatar-receiver">
                                {receiver ? receiver.slice(0, 2).toUpperCase() : "R"}
                            </div>
                            <div className="p2p-avatar-label">Receiver</div>
                        </div>
                    </div>

                    <div className="p2p-divider" />

                    {/* SENDER */}
                    <div className="p2p-field">
                        <label className="p2p-label">Sender ID</label>
                        <div className="p2p-input-wrap">
              <span className="p2p-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </span>
                            <input className="p2p-input sender" placeholder="Enter your ID"
                                   value={sender} onChange={(e) => setSender(e.target.value)} />
                        </div>
                    </div>

                    {/* RECEIVER */}
                    <div className="p2p-field">
                        <label className="p2p-label">Receiver ID</label>
                        <div className="p2p-input-wrap">
              <span className="p2p-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </span>
                            <input className="p2p-input receiver" placeholder="Enter receiver's ID"
                                   value={receiver} onChange={(e) => setReceiver(e.target.value)} />
                        </div>
                    </div>

                    {/* AMOUNT */}
                    <div className="p2p-field">
                        <label className="p2p-label">Amount</label>
                        <div className="p2p-input-wrap">
                            <span className="p2p-amount-prefix">₹</span>
                            <input className="p2p-input p2p-input-amount amount-inp"
                                   placeholder="0.00" type="number"
                                   value={amount} onChange={(e) => setAmount(e.target.value)} />
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="p2p-error">
              <span className="p2p-error-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </span>
                            {error}
                        </div>
                    )}

                    {/* SEND BTN */}
                    {!result && (
                        <button className="p2p-btn" onClick={sendMoney}
                                disabled={loading || !sender || !receiver || !amount}>
                            {loading ? (
                                <><div className="p2p-spinner" /> Sending...</>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13" />
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                    Send ₹{amount || "0"}
                                </>
                            )}
                        </button>
                    )}

                    {/* RESULT */}
                    {result && (
                        <div className="p2p-result">
                            <div className="p2p-result-badge">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Transfer Successful
                            </div>
                            <div className="p2p-result-rows">
                                <div className="p2p-result-row">
                                    <span className="p2p-result-key">Transaction ID</span>
                                    <span className="p2p-result-val">{result.transactionId ?? "TXN" + Date.now()}</span>
                                </div>
                                <div className="p2p-result-row">
                                    <span className="p2p-result-key">Status</span>
                                    <span className="p2p-result-val">{result.status ?? "SUCCESS"}</span>
                                </div>
                                <div className="p2p-result-sep" />
                                <div className="p2p-result-row">
                                    <span className="p2p-result-key">Amount Transferred</span>
                                    <span className="p2p-result-total">₹{amount}</span>
                                </div>
                            </div>
                            <button className="p2p-again-btn" onClick={reset}>Send another payment</button>
                        </div>
                    )}

                </div>

                {/* FOOTER */}
                <div className="p2p-footer">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    256-bit SSL encrypted · Secured by UPI
                </div>

            </div>
        </>
    );
}

export default P2P;