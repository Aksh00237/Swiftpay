import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
 
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
        body {
          background: #07070D;
          min-height: 100vh;
        }
 
        .lg-root {
          min-height: 100vh;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 40% at 80% 90%, rgba(59,130,246,0.1) 0%, transparent 60%),
                      #07070D;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
 
        /* ── CARD ── */
        .lg-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 2.8rem 2.4rem 2.4rem;
          backdrop-filter: blur(12px);
        }
 
        /* ── BRAND ── */
        .lg-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2.4rem;
        }
 
        .lg-brand-logo {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #7C3AED, #3B82F6);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 1.3rem;
          color: #fff;
          letter-spacing: -0.5px;
          box-shadow: 0 0 28px rgba(124,58,237,0.5);
          margin-bottom: 1rem;
        }
 
        .lg-brand-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 1.4rem;
          color: #fff;
          letter-spacing: -0.4px;
          margin-bottom: 0.3rem;
        }
 
        .lg-brand-sub {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.2px;
        }
 
        /* ── DIVIDER ── */
        .lg-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin-bottom: 2rem;
        }
 
        /* ── FORM ── */
        .lg-field {
          margin-bottom: 1rem;
        }
 
        .lg-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.7px;
          margin-bottom: 0.5rem;
        }
 
        .lg-input-wrap {
          position: relative;
        }
 
        .lg-input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          pointer-events: none;
        }
 
        .lg-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 0.85rem 1rem 0.85rem 2.8rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.92rem;
          color: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -webkit-appearance: none;
        }
 
        .lg-input::placeholder {
          color: rgba(255,255,255,0.2);
        }
 
        .lg-input:focus {
          border-color: #7C3AED;
          background: rgba(124,58,237,0.07);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.18);
        }
 
        /* ── FORGOT ── */
        .lg-forgot {
          text-align: right;
          margin-top: 0.5rem;
          margin-bottom: 1.6rem;
        }
 
        .lg-forgot a {
          font-size: 0.76rem;
          color: #A78BFA;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s;
        }
 
        .lg-forgot a:hover {
          color: #7C3AED;
        }
 
        /* ── BUTTON ── */
        .lg-btn {
          width: 100%;
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          border: none;
          border-radius: 12px;
          padding: 0.9rem;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.4);
          letter-spacing: 0.2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          outline: none;
        }
 
        .lg-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(124,58,237,0.55);
          filter: brightness(1.08);
        }
 
        .lg-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 12px rgba(124,58,237,0.3);
        }
 
        /* ── FOOTER ── */
        .lg-footer {
          text-align: center;
          margin-top: 1.8rem;
          font-size: 0.76rem;
          color: rgba(255,255,255,0.2);
          line-height: 1.6;
        }
 
        .lg-footer-lock {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          color: rgba(255,255,255,0.2);
          font-size: 0.73rem;
          margin-top: 0.4rem;
        }
      `}</style>

            <div className="lg-root">
                <div className="lg-card">

                    {/* BRAND */}
                    <div className="lg-brand">
                        <div className="lg-brand-logo">Pe</div>
                        <div className="lg-brand-name">SwiftPe</div>
                        <div className="lg-brand-sub">Sign in to your account</div>
                    </div>

                    <div className="lg-divider" />

                    {/* PHONE */}
                    <div className="lg-field">
                        <label className="lg-label">Phone Number</label>
                        <div className="lg-input-wrap">
              <span className="lg-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.8 19.8 0 01.1 2.22 2 2 0 012.1 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </span>
                            <input
                                className="lg-input"
                                placeholder="+91 98765 43210"
                                type="tel"
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div className="lg-field">
                        <label className="lg-label">Password</label>
                        <div className="lg-input-wrap">
              <span className="lg-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </span>
                            <input
                                className="lg-input"
                                placeholder="Enter your password"
                                type="password"
                            />
                        </div>
                    </div>

                    {/* FORGOT */}
                    <div className="lg-forgot">
                        <a>Forgot password?</a>
                    </div>

                    {/* LOGIN BTN */}
                    <button className="lg-btn" onClick={() => navigate("/home")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        Sign In
                    </button>

                    {/* FOOTER */}
                    <div className="lg-footer">
                        <div className="lg-footer-lock">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            256-bit SSL encrypted · Secured by UPI
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Login;