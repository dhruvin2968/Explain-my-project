// ─── Footer ───────────────────────────────────────────────────────────────────
/**
 * Props:
 *   dark  boolean
 */
export default function Footer({ dark }) {
  const borderColor = dark ? "#1a1a1a" : "#e5e5e5";
  const bg          = dark ? "#050505" : "#f5f5f0";
  const logoText    = dark ? "#f0f0f0" : "#0a0a0a";
  const linkColor   = dark ? "#555"    : "#999";
  const monoColor   = dark ? "#333"    : "#bbb";

  return (
    <footer style={{
      borderTop: `1px solid ${borderColor}`,
      background: bg,
      padding: "22px 32px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexWrap: "wrap", gap: "12px",
      transition: "background 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          width: 22, height: 22, background: "#F5A623", borderRadius: "5px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#000", fontFamily: "'Syne', sans-serif" }}>P</span>
        </div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "13px", color: logoText }}>PrepNPitch</span>
      </div>
      <div style={{ display: "flex", gap: "24px" }}>
        {["Privacy Policy", "Terms of Service", "Refund Policy"].map(l => (
          <a key={l} href="#" style={{ color: linkColor, fontSize: "12px", textDecoration: "none", transition: "color 0.2s" }}>{l}</a>
        ))}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: monoColor }}>
        © 2025 PrepNPitch
      </div>
    </footer>
  );
}