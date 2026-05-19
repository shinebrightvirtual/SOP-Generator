import { useState, useCallback, useEffect } from "react";
import { SECTION_ORDER } from "../lib/sections.js";
import { S } from "../styles/theme.js";
import { typography } from "../styles/theme.js";

import WelcomeScreen from "./WelcomeScreen.jsx";
import Header from "./Header.jsx";
import TierToggle from "./TierToggle.jsx";
import SectionNav from "./SectionNav.jsx";
import VideoImportPanel from "./VideoImportPanel.jsx";
import AIReviewFlow from "./AIReviewFlow.jsx";
import ManualEditor from "./ManualEditor.jsx";
import PreviewPanel from "./PreviewPanel.jsx";
import BrandPanel from "./BrandPanel.jsx";
import ExportBar from "./ExportBar.jsx";

const DEFAULT_BRAND = {
  logo: null,
  logoName: "",
  primaryColor: "#1B3A4B",
  accentColor: "#E8985E",
  businessName: "",
};

export default function App() {
  const [appStage, setAppStage] = useState("welcome");
  const [isPro, setIsPro] = useState(false);
  const [activeView, setActiveView] = useState("editor");
  const [activeSection, setActiveSection] = useState("overview");
  const [data, setData] = useState({});
  const [brand, setBrand] = useState({ ...DEFAULT_BRAND });

  // AI review flow state
  const [aiMode, setAiMode] = useState(false);
  const [aiData, setAiData] = useState({});
  const [sectionStatuses, setSectionStatuses] = useState({});

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = typography.fontUrl;
    document.head.appendChild(link);
  }, []);

  const handleFieldChange = useCallback((sectionId, key, value) => {
    if (aiMode) {
      setAiData(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], [key]: value } }));
    } else {
      setData(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], [key]: value } }));
    }
  }, [aiMode]);

  const handleStart = ({ businessName, startMethod }) => {
    setBrand(b => ({ ...b, businessName }));
    setAppStage("editor");
    if (startMethod === "video") {
      setIsPro(true);
    }
  };

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
    setData(aiData);
    setAiMode(false);
    setSectionStatuses({});
    setActiveView("editor");
    setActiveSection("overview");
  };

  const currentData = aiMode ? aiData : data;

  if (appStage === "welcome") {
    return <WelcomeScreen onStart={handleStart} initialBusinessName={brand.businessName} />;
  }

  return (
    <div style={S.app}>
      <Header businessName={brand.businessName} />

      <div style={{ maxWidth: "720px", margin: "14px auto 0", padding: "0 16px" }}>
        <TierToggle isPro={isPro} onToggle={() => setIsPro(p => !p)} />
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 16px" }}>
        <div style={S.tabRow}>
          <button style={S.tab(activeView === "editor")} onClick={() => setActiveView("editor")}>
            {aiMode ? "🤖 Review" : "✏️ Editor"}
          </button>
          <button style={S.tab(activeView === "preview")} onClick={() => setActiveView("preview")}>
            👁 Preview
          </button>
          {isPro && (
            <button style={S.tab(activeView === "brand")} onClick={() => setActiveView("brand")}>
              🎨 Brand
            </button>
          )}
        </div>
      </div>

      {activeView === "editor" && !aiMode && (
        <SectionNav activeSection={activeSection} isPro={isPro} onSelect={setActiveSection} />
      )}

      <div style={S.main}>
        {activeView === "editor" && !aiMode && (
          <VideoImportPanel onTranscriptReady={handleTranscriptReady} isPro={isPro} />
        )}

        {activeView === "editor" && aiMode && (
          <AIReviewFlow
            aiData={aiData}
            sectionStatuses={sectionStatuses}
            onConfirmSection={handleConfirmSection}
            onEditSection={handleEditSection}
            onConfirmAll={handleConfirmAll}
            onFieldChange={handleFieldChange}
          />
        )}

        {activeView === "editor" && !aiMode && (
          <ManualEditor
            activeSection={activeSection}
            data={data}
            isPro={isPro}
            onFieldChange={handleFieldChange}
            onUnlockPro={() => setIsPro(true)}
          />
        )}

        {activeView === "preview" && (
          <PreviewPanel data={currentData} brand={brand} isPro={isPro} />
        )}

        {activeView === "brand" && isPro && (
          <BrandPanel brand={brand} setBrand={setBrand} />
        )}
      </div>

      <ExportBar data={currentData} brand={brand} isPro={isPro} />
    </div>
  );
}
