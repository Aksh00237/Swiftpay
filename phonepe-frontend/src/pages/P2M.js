import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { P2M_API } from "../services/api";

function P2M() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState("");
    const [merchantId, setMerchantId] = useState("");
    const [amount, setAmount] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const pay = async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await P2M_API.post("/p2m/pay", {
                userId,
                merchantId,
                amount: Number(amount),
            });
            setResult(res.data);
        } catch {
            setError("Payment failed. Please check your details and try again.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError(null);
        setUserId("");
        setMerchantId("");
        setAmount("");
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
 
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
        body { background: #07070D; min-height: 100vh; }
 
        .p2m-root {
          min-height: 100vh;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(5,150,105,0.15) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 40% at 80% 90%, rgba(124,58,237,0.1) 0%, transparent 60%),
                      #07070D;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
 
        /* ── NAV ── */
        .p2m-nav {
          width: 100%;
          max-width: 460px;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 2rem;
        }
 
        .p2m-back {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        .p2m-back:hover { background: rgba(255,255,255,0.09); color: #fff; }
 
        .p2m-nav-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .p2m-nav-logo {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #7C3AED, #3B82F6);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; font-size: 0.75rem; color: #fff;
          box-shadow: 0 0 12px rgba(124,58,237,0.4);
        }
        .p2m-nav-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600; font-size: 0.9rem; color: rgba(255,255,255,0.6);
        }
        .p2m-nav-sep { color: rgba(255,255,255,0.2); font-size: 0.85rem; }
        .p2m-nav-page {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600; font-size: 0.9rem; color: #fff;
        }
 
        /* ── CARD ── */
        .p2m-card {
          width: 100%; max-width: 460px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 2.4rem 2.2rem;
          backdrop-filter: blur(12px);
        }
 
        /* ── HEADER ── */
        .p2m-header {
          display: flex; align-items: center; gap: 1rem;
          margin-bottom: 2rem;
        }
        .p2m-header-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: rgba(5,150,105,0.15);
          border: 1px solid rgba(5,150,105,0.3);
          display: flex; align-items: center; justify-content: center;
          color: #34D399;
          box-shadow: 0 4px 16px rgba(5,150,105,0.2);
          flex-shrink: 0;
        }
        .p2m-header-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.25rem; font-weight: 700; color: #fff;
          letter-spacing: -0.3px; margin-bottom: 0.15rem;
        }
        .p2m-header-sub {
          font-size: 0.78rem; color: rgba(255,255,255,0.35);
        }
 
        .p2m-divider {
          height: 1px; background: rgba(255,255,255,0.07);
          margin-bottom: 1.8rem;
        }
 
        /* ── FIELD ── */
        .p2m-field { margin-bottom: 1rem; }
        .p2m-label {
          display: block; font-size: 0.73rem; font-weight: 500;
          color: rgba(255,255,255,0.38); text-transform: uppercase;
          letter-spacing: 0.7px; margin-bottom: 0.45rem;
        }
        .p2m-input-wrap { position: relative; }
        .p2m-input-icon {
          position: absolute; left: 1rem; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.22);
          display: flex; align-items: center; pointer-events: none;
        }
        .p2m-input {
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
        .p2m-input::placeholder { color: rgba(255,255,255,0.18); }
        .p2m-input:focus {
          border-color: #059669;
          background: rgba(5,150,105,0.07);
          box-shadow: 0 0 0 3px rgba(5,150,105,0.15);
        }
 
        /* amount field special */
        .p2m-amount-prefix {
          position: absolute; left: 1rem; top: 50%;
          transform: translateY(-50%);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem; font-weight: 600;
          color: rgba(255,255,255,0.3);
          pointer-events: none;
        }
        .p2m-input-amount {
          padding-left: 2rem;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.1rem; font-weight: 600;
          letter-spacing: -0.3px;
        }
 
        /* ── PAY BTN ── */
        .p2m-btn {
          width: 100%; margin-top: 1.6rem;
          background: linear-gradient(135deg, #059669, #047857);
          border: none; border-radius: 12px;
          padding: 0.95rem;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.95rem; font-weight: 600; color: #fff;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s, filter 0.18s;
          box-shadow: 0 4px 20px rgba(5,150,105,0.35);
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          outline: none;
        }
        .p2m-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(5,150,105,0.5);
          filter: brightness(1.08);
        }
        .p2m-btn:active:not(:disabled) { transform: translateY(0); }
        .p2m-btn:disabled { opacity: 0.55; cursor: not-allowed; }
 
        /* spinner */
        .p2m-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
 
        /* ── ERROR ── */
        .p2m-error {
          margin-top: 1rem;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 12px;
          padding: 0.85rem 1rem;
          display: flex; align-items: flex-start; gap: 0.6rem;
          color: #FCA5A5; font-size: 0.82rem; line-height: 1.5;
        }
        .p2m-error-icon { flex-shrink: 0; margin-top: 1px; }
 
        /* ── RESULT ── */
        .p2m-result {
          margin-top: 1.4rem;
          background: rgba(5,150,105,0.08);
          border: 1px solid rgba(5,150,105,0.25);
          border-radius: 16px;
          padding: 1.4rem 1.2rem;
        }
        .p2m-result-header {
          display: flex; align-items: center; gap: 0.6rem;
          margin-bottom: 1.2rem;
        }
        .p2m-result-badge {
          display: inline-flex; align-items: center; gap: 0.35rem;
          background: rgba(5,150,105,0.15);
          border: 1px solid rgba(5,150,105,0.3);
          border-radius: 999px;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem; font-weight: 600;
          color: #34D399; letter-spacing: 0.3px;
        }
        .p2m-result-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.5);
          text-transform: uppercase; letter-spacing: 0.5px;
        }
 
        .p2m-result-rows { display: flex; flex-direction: column; gap: 0.75rem; }
        .p2m-result-row {
          display: flex; justify-content: space-between; align-items: center;
        }
        .p2m-result-key {
          font-size: 0.8rem; color: rgba(255,255,255,0.35);
        }
        .p2m-result-val {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.9rem; font-weight: 600; color: #fff;
        }
        .p2m-result-val.green { color: #34D399; }
        .p2m-result-sep {
          height: 1px; background: rgba(255,255,255,0.06);
          margin: 0.3rem 0;
        }
        .p2m-result-total {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.05rem; font-weight: 700; color: #fff;
        }
 
        .p2m-again-btn {
          width: 100%; margin-top: 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 0.7rem;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.82rem; font-weight: 500;
          color: rgba(255,255,255,0.45);
          cursor: pointer; transition: background 0.2s, color 0.2s;
        }
        .p2m-again-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); }
 
        .p2m-footer {
          margin-top: 1.6rem;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          font-size: 0.72rem; color: rgba(255,255,255,0.18);
        }
      `}</style>

            <div className="p2m-root">

                {/* NAV */}
                <div className="p2m-nav">
                    <button className="p2m-back" onClick={() => navigate("/home")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                    </button>
                    <div className="p2m-nav-brand">
                        <div className="p2m-nav-logo">Pe</div>
                        <span className="p2m-nav-name">SwiftPe</span>
                        <span className="p2m-nav-sep">/</span>
                        <span className="p2m-nav-page">P2M Payment</span>
                    </div>
                </div>

                {/* CARD */}
                <div className="p2m-card">

                    {/* HEADER */}
                    <div className="p2m-header">
                        <div className="p2m-header-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <path d="M2 10h20" />
                            </svg>
                        </div>
                        <div>
                            <div className="p2m-header-title">Pay Merchant</div>
                            <div className="p2m-header-sub">Instant UPI merchant payment</div>
                        </div>
                    </div>

                    <div className="p2m-divider" />

                    {/* USER ID */}
                    <div className="p2m-field">
                        <label className="p2m-label">User ID</label>
                        <div className="p2m-input-wrap">
              <span className="p2m-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </span>
                            <input className="p2m-input" placeholder="Enter your user ID"
                                   value={userId} onChange={(e) => setUserId(e.target.value)} />
                        </div>
                    </div>

                    {/* MERCHANT ID */}
                    <div className="p2m-field">
                        <label className="p2m-label">Merchant ID</label>
                        <div className="p2m-input-wrap">
              <span className="p2m-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
                            <input className="p2m-input" placeholder="Enter merchant ID"
                                   value={merchantId} onChange={(e) => setMerchantId(e.target.value)} />
                        </div>
                    </div>

                    {/* AMOUNT */}
                    <div className="p2m-field">
                        <label className="p2m-label">Amount</label>
                        <div className="p2m-input-wrap">
                            <span className="p2m-amount-prefix">₹</span>
                            <input className="p2m-input p2m-input-amount" placeholder="0.00"
                                   type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="p2m-error">
              <span className="p2m-error-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </span>
                            {error}
                        </div>
                    )}

                    {/* PAY BTN */}
                    {!result && (
                        <button className="p2m-btn" onClick={pay} disabled={loading || !userId || !merchantId || !amount}>
                            {loading ? (
                                <><div className="p2m-spinner" /> Processing...</>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                                    </svg>
                                    Pay ₹{amount || "0"}
                                </>
                            )}
                        </button>
                    )}

                    {/* RESULT */}
                    {result && (
                        <div className="p2m-result">
                            <div className="p2m-result-header">
                <span className="p2m-result-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Payment Successful
                </span>
                            </div>
                            <div className="p2m-result-rows">
                                <div className="p2m-result-row">
                                    <span className="p2m-result-key">Status</span>
                                    <span className="p2m-result-val green">{result.status}</span>
                                </div>
                                <div className="p2m-result-row">
                                    <span className="p2m-result-key">Platform Commission</span>
                                    <span className="p2m-result-val">₹{result.commission}</span>
                                </div>
                                <div className="p2m-result-sep" />
                                <div className="p2m-result-row">
                                    <span className="p2m-result-key">Merchant receives</span>
                                    <span className="p2m-result-total">₹{result.finalAmount}</span>
                                </div>
                            </div>
                            <button className="p2m-again-btn" onClick={reset}>Make another payment</button>
                        </div>
                    )}

                </div>

                {/* FOOTER */}
                <div className="p2m-footer">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    256-bit SSL encrypted · Secured by UPI
                </div>

            </div>
        </>
    );
}

export default P2M;