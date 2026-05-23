export default function SiteNav() {
  return (
    <>
      {/* Main nav bar */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #e8e3de",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "72px",
        fontFamily: "'Lato', sans-serif",
      }}>
        {/* Left: back link */}
        <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          <a
            href="https://www.shinebrightvirtual.com"
            style={{ fontSize: "13px", color: "#5a5a5a", textDecoration: "none", letterSpacing: "0.03em" }}
          >
            Home
          </a>
          <a
            href="https://www.shinebrightvirtual.com/about"
            style={{ fontSize: "13px", color: "#5a5a5a", textDecoration: "none", letterSpacing: "0.03em" }}
          >
            About Me
          </a>
          <a
            href="https://www.shinebrightvirtual.com/services"
            style={{ fontSize: "13px", color: "#5a5a5a", textDecoration: "none", letterSpacing: "0.03em" }}
          >
            Services
          </a>
        </div>

        {/* Center: brand name */}
        <a
          href="https://www.shinebrightvirtual.com"
          style={{ textDecoration: "none", textAlign: "center", position: "absolute", left: "50%", transform: "translateX(-50%)" }}
        >
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#803d1b", letterSpacing: "0.08em", lineHeight: 1.2, textTransform: "uppercase" }}>
            Shine Bright
          </div>
          <div style={{ fontSize: "11px", fontWeight: 400, color: "#5a5a5a", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Virtual Services
          </div>
        </a>

        {/* Right: CTA button */}
        <a
          href="https://www.shinebrightvirtual.com/contact"
          style={{
            padding: "10px 18px",
            background: "#2D3526",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textDecoration: "none",
            borderRadius: "4px",
            whiteSpace: "nowrap",
          }}
        >
          Book a Free Clarity Call
        </a>
      </div>

      {/* Rust accent stripe — matches Squarespace */}
      <div style={{ height: "6px", background: "#803d1b" }} />
    </>
  );
}
