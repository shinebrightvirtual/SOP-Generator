export default function SiteNav() {
  return (
    <div style={{
      background: "#fff",
      borderBottom: "1px solid #e8e3de",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: "'Lato', sans-serif",
    }}>
      {/* Back link */}
      <a
        href="https://www.shinebrightvirtual.com"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          color: "#803d1b",
          textDecoration: "none",
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        <span style={{ fontSize: "16px", lineHeight: 1 }}>←</span>
        Back to Shine Bright Virtual
      </a>

      {/* Logo — centered */}
      <a
        href="https://www.shinebrightvirtual.com"
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          textDecoration: "none",
          textAlign: "center",
          lineHeight: 1.15,
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#803d1b", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Shine Bright
        </div>
        <div style={{ fontSize: "9px", fontWeight: 400, color: "#7a7a7a", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Virtual Services
        </div>
      </a>

      {/* Spacer to keep logo centered */}
      <div style={{ width: "180px" }} />
    </div>
  );
}
