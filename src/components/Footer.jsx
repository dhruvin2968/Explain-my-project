// ─── Footer ───────────────────────────────────────────────────────────────────
/**
 * Props:
 *   dark  boolean
 */
export default function Footer({ dark }) {
  const links = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
  ];

  return (
    <footer style={{
        borderTop: "1px solid #111", padding: "24px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: 22, height: 22, background: "#F5A623", borderRadius: "5px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#000", fontFamily: "Syne" }}>P</span>
          </div>
          <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: "13px" }}>PrepNPitch</span>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          {["Privacy Policy", "Terms of Service", "Refund Policy"].map(l => (
            <a key={l} href="#" style={{ color: "#444", fontSize: "12px", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#333" }}>
          © 2025 PrepNPitch
        </div>
      </footer>
  );
}