import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ESCROW_API, asUser, getErrorMessage } from "../services/api";

// Demo identities from scripts/seed.js, plus the admin who resolves disputes
const DEMO_USERS = ["user1", "user2", "user3", "admin"];
const STORAGE_KEY = "swiftpe.escrow.userId";

const newKey = () =>
    (window.crypto && window.crypto.randomUUID)
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const loadUser = () => {
    try { return localStorage.getItem(STORAGE_KEY) || "user1"; } catch { return "user1"; }
};

const STATUS_STYLE = {
    HELD: { label: "Funds held", color: "#FBBF24" },
    SHIPPED: { label: "Shipped", color: "#60A5FA" },
    DISPUTED: { label: "Disputed", color: "#F87171" },
    RELEASED: { label: "Paid to seller", color: "#34D399" },
    REFUNDED: { label: "Refunded", color: "#A78BFA" },
};

const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

function Escrow() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(loadUser);
    const [tab, setTab] = useState("new");

    // New order form
    const [sellerId, setSellerId] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [idempotencyKey, setIdempotencyKey] = useState(newKey);

    const [orders, setOrders] = useState([]);
    const [disputed, setDisputed] = useState([]);
    const [busy, setBusy] = useState(null);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [openId, setOpenId] = useState(null);
    const [disputeFor, setDisputeFor] = useState(null);
    const [reason, setReason] = useState("");

    const isAdmin = userId === "admin";

    const switchUser = (id) => {
        setUserId(id);
        setError(null);
        setNotice(null);
        try { localStorage.setItem(STORAGE_KEY, id); } catch { /* storage unavailable */ }
        if (id === "admin") setTab("disputes");
        else if (tab === "disputes") setTab("orders");
    };

    const loadOrders = useCallback(async () => {
        if (!userId) return;
        try {
            if (userId === "admin") {
                const res = await ESCROW_API.get("/escrow/disputed", asUser(userId));
                setDisputed(res.data);
            } else {
                const res = await ESCROW_API.get("/escrow", asUser(userId));
                setOrders(res.data);
            }
        } catch (err) {
            setError(getErrorMessage(err, "Could not load orders. Is escrow-service running on 8084?"));
        }
    }, [userId]);

    useEffect(() => {
        if (tab !== "new") loadOrders();
    }, [tab, loadOrders]);

    const createOrder = async () => {
        setError(null);
        setNotice(null);
        setBusy("create");
        try {
            const res = await ESCROW_API.post(
                "/escrow",
                { sellerId, amount: Number(amount), description },
                asUser(userId, { "Idempotency-Key": idempotencyKey })
            );
            setNotice(`₹${res.data.amount} is now held safely. ${res.data.sellerId} gets it after you confirm delivery.`);
            setSellerId("");
            setAmount("");
            setDescription("");
            setIdempotencyKey(newKey()); // next order gets a fresh key; a retry of this one would reuse the old key
        } catch (err) {
            setError(getErrorMessage(err, "Could not create the order."));
        } finally {
            setBusy(null);
        }
    };

    const act = async (orderId, action, body = undefined, message) => {
        setError(null);
        setNotice(null);
        setBusy(orderId); // disables every button on this order while a request is in flight
        try {
            await ESCROW_API.post(`/escrow/${orderId}/${action}`, body, asUser(userId));
            setNotice(message);
            setDisputeFor(null);
            setReason("");
            await loadOrders();
        } catch (err) {
            setError(getErrorMessage(err, "Action failed."));
        } finally {
            setBusy(null);
        }
    };

    const actionsFor = (o) => {
        const isBuyer = o.buyerId === userId;
        const isSeller = o.sellerId === userId;
        const list = [];
        if (isAdmin && o.status === "DISPUTED") {
            list.push({ key: "refund", label: "Refund buyer", run: () => act(o.id, "resolve", { outcome: "REFUND" }, "Refunded to buyer.") });
            list.push({ key: "release", label: "Release to seller", primary: true, run: () => act(o.id, "resolve", { outcome: "RELEASE" }, "Released to seller.") });
            return list;
        }
        if (isSeller && o.status === "HELD") {
            list.push({ key: "cancel", label: "Cancel & refund", run: () => act(o.id, "cancel", undefined, "Order cancelled, buyer refunded.") });
            list.push({ key: "ship", label: "Mark shipped", primary: true, run: () => act(o.id, "ship", undefined, "Marked as shipped.") });
        }
        if (o.status === "SHIPPED" && (isBuyer || isSeller)) {
            list.push({ key: "dispute", label: "Raise dispute", run: () => setDisputeFor(o.id) });
            if (isBuyer) {
                list.push({ key: "confirm", label: "Confirm received", primary: true, run: () => act(o.id, "confirm", undefined, "Payment released to seller.") });
            }
        }
        return list;
    };

    const deadlineText = (o) => {
        if (o.status === "HELD") return `Seller must ship by ${fmtDate(o.deliveryDeadline)} or you're auto-refunded`;
        if (o.status === "SHIPPED") return `Auto-pays seller on ${fmtDate(o.autoReleaseAt)} unless confirmed or disputed`;
        if (o.status === "DISPUTED") return `Dispute: ${o.disputeReason} (raised by ${o.raisedBy})`;
        return null;
    };

    const list = isAdmin ? disputed : orders;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07070D; min-height: 100vh; }

        .esc-root {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(20,184,166,0.14) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 85% 90%, rgba(124,58,237,0.1) 0%, transparent 60%),
            #07070D;
          font-family: 'Inter', sans-serif;
          display: flex; flex-direction: column; align-items: center;
          padding: 2rem 1rem;
        }

        .esc-nav { width: 100%; max-width: 560px; display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.6rem; }
        .esc-back {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5); cursor: pointer; flex-shrink: 0;
        }
        .esc-back:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .esc-nav-logo {
          width: 28px; height: 28px; border-radius: 8px;
          background: linear-gradient(135deg, #7C3AED, #3B82F6);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.75rem; color: #fff;
        }
        .esc-nav-name { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 0.9rem; color: rgba(255,255,255,0.6); }
        .esc-nav-sep { color: rgba(255,255,255,0.2); }
        .esc-nav-page { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 0.9rem; color: #fff; }

        .esc-card {
          width: 100%; max-width: 560px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px; padding: 2rem 1.6rem; backdrop-filter: blur(12px);
        }

        .esc-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.4rem; }
        .esc-header-icon {
          width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
          background: rgba(20,184,166,0.12); border: 1px solid rgba(20,184,166,0.3);
          display: flex; align-items: center; justify-content: center; color: #2DD4BF;
        }
        .esc-title { font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; font-weight: 700; color: #fff; }
        .esc-sub { font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-top: 0.15rem; line-height: 1.45; }

        .esc-steps { display: flex; gap: 0.4rem; margin-bottom: 1.4rem; flex-wrap: wrap; }
        .esc-step {
          font-size: 0.7rem; color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 999px; padding: 0.25rem 0.65rem;
        }

        .esc-as { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1.2rem; }
        .esc-as-label { font-size: 0.72rem; color: rgba(255,255,255,0.38); text-transform: uppercase; letter-spacing: 0.7px; margin-right: 0.2rem; }
        .esc-chip {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 600;
          padding: 0.3rem 0.75rem; border-radius: 999px; cursor: pointer;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.55);
        }
        .esc-chip.active { background: rgba(20,184,166,0.15); border-color: rgba(20,184,166,0.45); color: #5EEAD4; }

        .esc-tabs { display: flex; gap: 0.3rem; background: rgba(255,255,255,0.04); border-radius: 12px; padding: 0.25rem; margin-bottom: 1.4rem; }
        .esc-tab {
          flex: 1; border: none; background: none; cursor: pointer; border-radius: 9px; padding: 0.55rem;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.45);
        }
        .esc-tab.active { background: rgba(20,184,166,0.16); color: #fff; }

        .esc-field { margin-bottom: 1rem; }
        .esc-label { display: block; font-size: 0.73rem; font-weight: 500; color: rgba(255,255,255,0.38); text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 0.45rem; }
        .esc-input {
          width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px; padding: 0.8rem 1rem; font-family: 'Inter', sans-serif; font-size: 0.9rem; color: #fff; outline: none;
        }
        .esc-input::placeholder { color: rgba(255,255,255,0.2); }
        .esc-input:focus { border-color: #14B8A6; background: rgba(20,184,166,0.06); box-shadow: 0 0 0 3px rgba(20,184,166,0.14); }

        .esc-btn {
          width: 100%; margin-top: 0.6rem; border: none; border-radius: 12px; padding: 0.95rem; cursor: pointer;
          background: linear-gradient(135deg, #14B8A6, #0F766E); color: #fff;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem; font-weight: 600;
          box-shadow: 0 4px 20px rgba(20,184,166,0.3);
        }
        .esc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .esc-msg { margin-top: 1rem; border-radius: 12px; padding: 0.8rem 1rem; font-size: 0.82rem; line-height: 1.5; }
        .esc-msg.err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #FCA5A5; }
        .esc-msg.ok { background: rgba(20,184,166,0.1); border: 1px solid rgba(20,184,166,0.28); color: #5EEAD4; }

        .esc-empty { text-align: center; color: rgba(255,255,255,0.35); font-size: 0.85rem; padding: 2rem 0; }
        .esc-list { display: flex; flex-direction: column; gap: 0.8rem; }
        .esc-order { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1rem 1.1rem; }
        .esc-order-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.8rem; }
        .esc-order-desc { font-family: 'Space Grotesk', sans-serif; font-weight: 600; color: #fff; font-size: 0.95rem; overflow-wrap: anywhere; }
        .esc-order-meta { font-size: 0.74rem; color: rgba(255,255,255,0.4); margin-top: 0.2rem; }
        .esc-order-amt { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: #fff; font-size: 1.05rem; white-space: nowrap; }
        .esc-badge {
          display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.6rem;
          font-size: 0.7rem; font-weight: 600; border-radius: 999px; padding: 0.2rem 0.65rem;
          background: rgba(255,255,255,0.05); border: 1px solid currentColor;
        }
        .esc-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .esc-deadline { font-size: 0.74rem; color: rgba(255,255,255,0.45); margin-top: 0.55rem; line-height: 1.45; }
        .esc-actions { display: flex; gap: 0.5rem; margin-top: 0.8rem; flex-wrap: wrap; }
        .esc-act {
          flex: 1; min-width: 120px; border-radius: 10px; padding: 0.6rem; cursor: pointer;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.8rem; font-weight: 600;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.75);
        }
        .esc-act.primary { background: rgba(20,184,166,0.18); border-color: rgba(20,184,166,0.45); color: #5EEAD4; }
        .esc-act:disabled { opacity: 0.5; cursor: not-allowed; }
        .esc-link { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 0.74rem; cursor: pointer; margin-top: 0.6rem; padding: 0; text-decoration: underline; }
        .esc-timeline { margin-top: 0.7rem; border-left: 1px solid rgba(255,255,255,0.12); padding-left: 0.9rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .esc-tl-item { font-size: 0.75rem; color: rgba(255,255,255,0.6); line-height: 1.4; }
        .esc-tl-item b { color: #fff; font-weight: 600; }
        .esc-tl-when { color: rgba(255,255,255,0.35); }
        .esc-refresh { background: none; border: none; color: #5EEAD4; font-size: 0.78rem; cursor: pointer; margin-bottom: 0.8rem; }
      `}</style>

            <div className="esc-root">
                <div className="esc-nav">
                    <button className="esc-back" onClick={() => navigate("/home")} aria-label="Back">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                    </button>
                    <div className="esc-nav-logo">Pe</div>
                    <span className="esc-nav-name">SwiftPe</span>
                    <span className="esc-nav-sep">/</span>
                    <span className="esc-nav-page">Safe Pay</span>
                </div>

                <div className="esc-card">
                    <div className="esc-header">
                        <div className="esc-header-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" /><path d="M9 12l2 2 4-4" />
                            </svg>
                        </div>
                        <div>
                            <div className="esc-title">Safe Pay</div>
                            <div className="esc-sub">Buying from someone you don't know? Your money is held by SwiftPe until you confirm delivery.</div>
                        </div>
                    </div>

                    <div className="esc-steps">
                        <span className="esc-step">1 · You pay, money is held</span>
                        <span className="esc-step">2 · Seller ships</span>
                        <span className="esc-step">3 · You confirm, seller is paid</span>
                    </div>

                    {/* There is no login yet: pick who you are acting as */}
                    <div className="esc-as">
                        <span className="esc-as-label">Acting as</span>
                        {DEMO_USERS.map((u) => (
                            <button key={u} className={`esc-chip ${userId === u ? "active" : ""}`} onClick={() => switchUser(u)}>
                                {u}
                            </button>
                        ))}
                    </div>

                    <div className="esc-tabs">
                        {isAdmin ? (
                            <button className="esc-tab active">Disputes to resolve</button>
                        ) : (
                            <>
                                <button className={`esc-tab ${tab === "new" ? "active" : ""}`} onClick={() => setTab("new")}>New Safe Pay</button>
                                <button className={`esc-tab ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>My orders</button>
                            </>
                        )}
                    </div>

                    {!isAdmin && tab === "new" && (
                        <>
                            <div className="esc-field">
                                <label className="esc-label">Seller ID</label>
                                <input className="esc-input" placeholder="e.g. user2" value={sellerId} onChange={(e) => setSellerId(e.target.value)} />
                            </div>
                            <div className="esc-field">
                                <label className="esc-label">Amount (₹)</label>
                                <input className="esc-input" type="number" min="1" placeholder="500" value={amount} onChange={(e) => setAmount(e.target.value)} />
                            </div>
                            <div className="esc-field">
                                <label className="esc-label">What are you buying?</label>
                                <input className="esc-input" maxLength={200} placeholder="Custom phone cover" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <button className="esc-btn" disabled={busy === "create" || !sellerId || !amount} onClick={createOrder}>
                                {busy === "create" ? "Holding funds…" : "Pay & hold safely"}
                            </button>
                        </>
                    )}

                    {(isAdmin || tab === "orders") && (
                        <>
                            <button className="esc-refresh" onClick={loadOrders}>↻ Refresh</button>
                            {list.length === 0 ? (
                                <div className="esc-empty">{isAdmin ? "No open disputes." : "No Safe Pay orders yet."}</div>
                            ) : (
                                <div className="esc-list">
                                    {list.map((o) => {
                                        const st = STATUS_STYLE[o.status] || { label: o.status, color: "#fff" };
                                        const role = o.buyerId === userId ? `Buying from ${o.sellerId}` : o.sellerId === userId ? `Selling to ${o.buyerId}` : `${o.buyerId} → ${o.sellerId}`;
                                        const deadline = deadlineText(o);
                                        return (
                                            <div className="esc-order" key={o.id}>
                                                <div className="esc-order-top">
                                                    <div>
                                                        <div className="esc-order-desc">{o.description || "Safe Pay order"}</div>
                                                        <div className="esc-order-meta">{role} · {fmtDate(o.createdAt)}</div>
                                                    </div>
                                                    <div className="esc-order-amt">₹{Number(o.amount).toFixed(2)}</div>
                                                </div>
                                                <span className="esc-badge" style={{ color: st.color }}><span className="esc-dot" />{st.label}</span>
                                                {deadline && <div className="esc-deadline">{deadline}</div>}

                                                {disputeFor === o.id ? (
                                                    <div className="esc-actions">
                                                        <input className="esc-input" placeholder="What went wrong?" value={reason} onChange={(e) => setReason(e.target.value)} />
                                                        <button className="esc-act" onClick={() => { setDisputeFor(null); setReason(""); }}>Back</button>
                                                        <button className="esc-act primary" disabled={!reason.trim() || busy === o.id}
                                                                onClick={() => act(o.id, "dispute", { reason }, "Dispute raised. Money is frozen until an admin decides.")}>
                                                            Submit dispute
                                                        </button>
                                                    </div>
                                                ) : (
                                                    actionsFor(o).length > 0 && (
                                                        <div className="esc-actions">
                                                            {actionsFor(o).map((a) => (
                                                                <button key={a.key} className={`esc-act ${a.primary ? "primary" : ""}`}
                                                                        disabled={busy === o.id} onClick={a.run}>
                                                                    {a.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )
                                                )}

                                                <button className="esc-link" onClick={() => setOpenId(openId === o.id ? null : o.id)}>
                                                    {openId === o.id ? "Hide history" : "Show history"}
                                                </button>
                                                {openId === o.id && (
                                                    <div className="esc-timeline">
                                                        {o.history.map((h, i) => (
                                                            <div className="esc-tl-item" key={i}>
                                                                <b>{STATUS_STYLE[h.to]?.label || h.to}</b> by {h.actor} — {h.note}{" "}
                                                                <span className="esc-tl-when">{fmtDate(h.at)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {error && <div className="esc-msg err">{error}</div>}
                    {notice && <div className="esc-msg ok">{notice}</div>}
                </div>
            </div>
        </>
    );
}

export default Escrow;
