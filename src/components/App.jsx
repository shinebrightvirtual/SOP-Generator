import { useState, useCallback, useEffect } from "react";
import { SECTIONS, SECTION_ORDER, getSectionsForType } from "../lib/sections.js";
import { colors, typography, radii } from "../styles/theme.js";

import WelcomeScreen from "./WelcomeScreen.jsx";
import SiteNav from "./SiteNav.jsx";
import AIReviewFlow from "./AIReviewFlow.jsx";
import ManualEditor from "./ManualEditor.jsx";
import PreviewPanel from "./PreviewPanel.jsx";
import ExportBar from "./ExportBar.jsx";

const DEFAULT_BRAND = {
  logo: null,
  logoName: "",
  primaryColor: "#2D3526",
  accentColor: "#C49A3C",
  businessName: "",
  createdBy: "",
};

export default function App() {
  const [appStage, setAppStage] = useState("welcome");
  const [sopType, setSopType] = useState("basic");
  const [activeView, setActiveView] = useState("editor");
  const [activeSection, setActiveSection] = useState("overview");
  const [data, setData] = useState({
    overview: { versionDate: new Date().toISOString().slice(0, 10) },
  });
  const [brand, setBrand] = useState({ ...DEFAULT_BRAND });
  const [aiMode, setAiMode] = useState(false);
  const [aiData, setAiData] = useState({});
  const [sectionStatuses, setSectionStatuses] = useState({});

  const isEmbedded = new URLSearchParams(window.location.search).get("embed") === "1";

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = typography.fontUrl;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!isEmbedded) return;
    const sendHeight = () => {
      const h = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "sb-sop-height", height: h }, "*");
    };
    sendHeight();
    const ro = new ResizeObserver(sendHeight);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [isEmbedded, appStage, activeView]);

  const sectionKeys = getSectionsForType(sopType);

  const handleStart = ({ sopType: type }) => {
    setSopType(type);
    setAppStage("editor");
  };

  const handleFieldChange = useCallback((sectionId, key, value) => {
    if (aiMode) {
      setAiData(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], [key]: value } }));
    } else {
      setData(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], [key]: value } }));
    }
  }, [aiMode]);

  const handleTranscriptReady = (parsed) => {
    setAiData(parsed);
    const statuses = {};
    SECTION_ORDER.forEach(k => { statuses[k] = "suggested"; });
    setSectionStatuses(statuses);
    setAiMode(true);
    setActiveView("editor");
  };

  const handleConfirmSection = (key) => {
    setSectionStatuses(prev => ({ ...prev, [key]: "confirmed" }));
  };

  const handleEditSection = (key) => {
    setSectionStatuses(prev => ({ ...prev, [key]: "editing" }));
  };

  const handleConfirmAll = () => {
    setData({
      ...aiData,
      overview: {
        ...aiData.overview,
        versionDate: new Date().toISOString().slice(0, 10),
      },
    });
    setAiMode(false);
    setSectionStatuses({});
    setActiveView("editor");
    setActiveSection("overview");
  };

  const handleNextSection = () => {
    const idx = sectionKeys.indexOf(activeSection);
    if (idx < sectionKeys.length - 1) {
      setActiveSection(sectionKeys[idx + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevSection = () => {
    const idx = sectionKeys.indexOf(activeSection);
    if (idx > 0) {
      setActiveSection(sectionKeys[idx - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentData = aiMode ? aiData : data;
  const currentIdx = sectionKeys.indexOf(activeSection);
  const progress = ((currentIdx + 1) / sectionKeys.length) * 100;

  if (appStage === "welcome") {
    return (
      <WelcomeScreen
        onStart={handleStart}
        onTranscriptReady={handleTranscriptReady}
        isEmbedded={isEmbedded}
      />
    );
  }

  const viewBtnStyle = (active) => ({
    flex: 1,
    padding: "6px 10px",
    borderRadius: radii.md,
    border: "none",
    background: active ? colors.primary : "transparent",
    color: active ? colors.white : colors.textMuted,
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: typography.fontFamily,
    transition: "all 0.2s",
  });

  const sidebarNavItem = (active) => ({
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "8px 10px 8px 14px",
    background: "transparent",
    border: "none",
    borderLeft: `2px solid ${active ? colors.accent : "transparent"}`,
    color: active ? colors.primary : colors.textMuted,
    fontSize: "13px",
    fontWeight: active ? 700 : 400,
    cursor: "pointer",
    fontFamily: typography.fontFamily,
    transition: "color 0.15s, border-color 0.15s",
    marginBottom: "1px",
    lineHeight: 1.35,
  });

  return (
    <div style={{ minHeight: "100vh", background: isEmbedded ? "#EBE6E3" : colors.pageBg, fontFamily: typography.fontFamily, color: colors.textPrimary }}>
      {!isEmbedded && <SiteNav />}

      {/* Preview mode — full centered column */}
      {activeView === "preview" && (
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "28px 20px 120px" }}>
          <button
            onClick={() => setActiveView("editor")}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "20px", background: "none", border: "none", color: colors.textMuted, fontSize: "13px", cursor: "pointer", fontFamily: typography.fontFamily, padding: 0 }}
          >
            ← Back to editor
          </button>
          <PreviewPanel data={currentData} brand={brand} sopType={sopType} />
        </div>
      )}

      {/* Editor mode — two-column layout */}
      {activeView !== "preview" && (
        <div style={{ maxWidth: "920px", margin: "0 auto", padding: "36px 24px 120px", display: "flex", gap: "44px", alignItems: "flex-start" }}>

          {/* LEFT SIDEBAR */}
          <div style={{ width: "172px", flexShrink: 0, position: "sticky", top: "24px" }}>

            {/* View toggle */}
            <div style={{ display: "flex", background: "rgba(45,53,38,0.07)", borderRadius: radii.md, padding: "3px", marginBottom: "28px" }}>
              <button style={viewBtnStyle(true)} onClick={() => {}}>
                {aiMode ? "Review" : "Editor"}
              </button>
              <button style={viewBtnStyle(false)} onClick={() => setActiveView("preview")}>
                Preview
              </button>
            </div>

            {/* Section list */}
            {!aiMode && (
              <>
                <div style={{ fontSize: "10px", color: colors.textFaint, fontFamily: typography.fontFamily, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", paddingLeft: "14px" }}>
                  Sections
                </div>
                {sectionKeys.map(key => (
                  <button key={key} onClick={() => setActiveSection(key)} style={sidebarNavItem(key === activeSection)}>
                    {SECTIONS[key].title}
                  </button>
                ))}

                {/* Progress */}
                <div style={{ paddingLeft: "14px", marginTop: "16px" }}>
                  <div style={{ height: "2px", background: colors.border, borderRadius: "1px", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: colors.accent, width: `${progress}%`, transition: "width 0.4s ease" }} />
                  </div>
                  <div style={{ fontSize: "10px", color: colors.textFaint, marginTop: "5px", fontFamily: typography.fontFamily }}>
                    {currentIdx + 1} / {sectionKeys.length} sections
                  </div>
                </div>
              </>
            )}

            {/* Format toggle */}
            <div style={{ marginTop: "28px", paddingLeft: "14px", borderTop: `1px solid ${colors.border}`, paddingTop: "16px" }}>
              <div style={{ fontSize: "10px", color: colors.textFaint, fontFamily: typography.fontFamily, marginBottom: "8px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Format
              </div>
              {["basic", "detailed"].map(t => (
                <button key={t} onClick={() => setSopType(t)} style={{
                  display: "block", textAlign: "left", background: "none", border: "none",
                  padding: "3px 0", fontSize: "12px",
                  fontWeight: sopType === t ? 700 : 400,
                  color: sopType === t ? colors.primary : colors.textMuted,
                  cursor: "pointer", fontFamily: typography.fontFamily, width: "100%",
                }}>
                  {sopType === t && <span style={{ color: colors.accent, marginRight: "5px" }}>✓</span>}
                  {t === "basic" ? "Basic" : "Full Detail"}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {aiMode ? (
              <AIReviewFlow
                aiData={aiData}
                sectionStatuses={sectionStatuses}
                onConfirmSection={handleConfirmSection}
                onEditSection={handleEditSection}
                onConfirmAll={handleConfirmAll}
                onFieldChange={handleFieldChange}
              />
            ) : (
              <ManualEditor
                activeSection={activeSection}
                sectionKeys={sectionKeys}
                data={data}
                sopType={sopType}
                onFieldChange={handleFieldChange}
                onNext={handleNextSection}
                onPrev={handlePrevSection}
              />
            )}
          </div>

        </div>
      )}

      <ExportBar data={currentData} brand={brand} setBrand={setBrand} sopType={sopType} />
    </div>
  );
}
