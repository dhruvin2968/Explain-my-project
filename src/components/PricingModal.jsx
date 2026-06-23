import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Plans ────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "",
    desc: "Get started, no card needed.",
    features: ["3 project explanations", "5 resume checks", "Basic interview Qs", "Job match (2/mo)"],
    cta: "Current plan",
    highlight: false,
    amount: 0,
  },
  {
    id: "pro_monthly",
    name: "Pro",
    price: "₹99",
    period: "/month",
    desc: "For serious job seekers.",
    badge: "Most Popular",
    features: [
      "Unlimited project explanations",
      "All 5 output sections",
      "Voice mock interviews",
      "Unlimited job matching",
      "PDF exports",
      "Priority AI responses",
    ],
    cta: "Go Pro →",
    highlight: true,
    amount: 9900,
  },
  {
    id: "pro_yearly",
    name: "Annual",
    price: "₹999",
    period: "/year",
    desc: "Save ₹789 vs monthly.",
    badge: "Best Value",
    features: [
      "Everything in Pro",
      "2 months free",
      "Early feature access",
      "Priority support",
    ],
    cta: "Get Annual →",
    highlight: false,
    amount: 99900,
  },
];

// ─── PricingModal ─────────────────────────────────────────────────────────────
export default function PricingModal({ dark, onClose, onSuccess, uid }) {
  const [paying, setPaying] = useState(null);

  const bg       = dark ? "#0d0d0d" : "#ffffff";
  const border   = dark ? "#1a1a1a" : "#e5e5e5";
  const textMain = dark ? "#f0f0f0" : "#0a0a0a";
  const textSub  = dark ? "#666"    : "#999";
  const cardBg   = dark ? "#111"    : "#fafaf8";

  const handlePlanSelect = async (plan) => {
    if (plan.amount === 0) { onClose(); return; }

    setPaying(plan.id);
    try {
      const res = await fetch(`${API_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: plan.amount, planId: plan.id }),
      });
      const order = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "PrepNPitch",
        description: plan.name + " Plan",
        order_id: order.id,
        handler: async (response) => {
          try {
            await fetch(`${API_URL}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, planId: plan.id, uid }),
            });
            onSuccess?.(plan.id);
          } catch {
            // payment verified on Razorpay, ignore verify endpoint errors
          }
          onClose();
        },
        theme: { color: "#F5A623" },
        modal: { ondismiss: () => setPaying(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Could not initiate payment. Please try again.");
      setPaying(null);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      {/* Backdrop */}
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div style={{ position: "relative", width: "100%", maxWidth: 880, maxHeight: "90vh", overflowY: "auto", background: bg, border: `1px solid ${border}`, borderRadius: 16, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: `1px solid ${border}`, background: bg }}>
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: textMain, margin: 0 }}>
              Choose your plan
            </h2>
            <p style={{ fontSize: 13, color: textSub, margin: "4px 0 0" }}>
              Unlock unlimited generations and all features
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${border}`, borderRadius: 8, cursor: "pointer", color: textSub, fontSize: 20, lineHeight: 1, fontWeight: 300 }}
          >
            ×
          </button>
        </div>

        {/* Plans grid */}
        <div style={{ padding: "28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                position: "relative",
                background: plan.highlight ? (dark ? "#0f0d09" : "#fffbf2") : cardBg,
                border: plan.highlight ? "1px solid #F5A623" : `1px solid ${border}`,
                borderRadius: 12,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                transition: "border-color 0.2s",
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#F5A623", color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 12px", borderRadius: 99, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                  {plan.badge}
                </div>
              )}

              {/* Name */}
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: textMain, marginBottom: 8 }}>
                {plan.name}
              </div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: plan.highlight ? "#F5A623" : textMain }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: 13, color: textSub }}>{plan.period}</span>
              </div>

              <p style={{ fontSize: 12, color: textSub, marginBottom: 22 }}>{plan.desc}</p>

              {/* Features */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ fontSize: 12, color: dark ? "#aaa" : "#555", display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#F5A623", marginTop: 1, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handlePlanSelect(plan)}
                disabled={paying === plan.id || plan.amount === 0}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: plan.highlight ? "#F5A623" : "transparent",
                  color: plan.highlight ? "#000" : (plan.amount === 0 ? textSub : textMain),
                  border: plan.highlight ? "none" : `1px solid ${border}`,
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: plan.amount === 0 ? "default" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: paying === plan.id ? 0.65 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {paying === plan.id ? "Processing…" : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ padding: "0 28px 22px", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: dark ? "#333" : "#ccc", fontFamily: "'JetBrains Mono', monospace" }}>
            Secure payment via Razorpay · Cancel anytime · No hidden fees
          </p>
        </div>
      </div>
    </div>
  );
}
