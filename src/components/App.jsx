import { useState, useCallback, useEffect, useRef } from "react";
import { SECTION_ORDER, getSectionsForType } from "../lib/sections.js";
import { S } from "../styles/theme.js";
import { typography } from "../styles/theme.js";

import WelcomeScreen from "./WelcomeScreen.jsx";
import Header from "./Header.jsx";
import SiteNav from "./SiteNav.jsx";
import SectionNav from "./SectionNav.jsx";
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
  const [data, setData] = useState({});
  const [brand, setBrand] = useState({ ...DEFAULT_BRAND });

  const [aiMode, setAiMode] = useState(false);
  const [aiData, setAiData] = useState({});
  const [sectionStatuses, setSectionStatuses] = useState({});

  // Hide our own header/branding bar when embedded in an iframe via ?embed=1
  const isEmbedded = new URLSearchParams(window.location.search).get("embed") === "1";

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = typography.fontUrl;
    document.head.appendChild(link);
  }, []);

  // When embedded, send height updates to the parent so the iframe auto-resizes
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
    setData(aiData);
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

  if (appStage === "welcome") {
    return (
      <WelcomeScreen
        onStart={handleStart}
        onTranscriptReady={handleTranscriptReady}
        isEmbedded={isEmbedded}
      />
    );
  }

  return (
    <div style={{ ...S.app, background: isEmbedded ? "#EBE6E3" : S.app.background }}>
      {!isEmbedded && <SiteNav />}

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "20px 16px 0" }}>
        <div style={{ ...S.tabRow, justifyContent: "center", marginBottom: "24px" }}>
          <button style={S.tab(activeView === "editor")} onClick={() => setActiveView("editor")}>
            {aiMode ? "Review" : "Editor"}
          </button>
          <button style={S.tab(activeView === "preview")} onClick={() => setActiveView("preview")}>
            Preview
          </button>
        </div>
      </div>

      {activeView === "editor" && !aiMode && (
        <SectionNav
          activeSection={activeSection}
          sopType={sopType}
          sectionKeys={sectionKeys}
          onSelect={setActiveSection}
        />
      )}

      <div style={S.main}>
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
            sectionKeys={sectionKeys}
            data={data}
            sopType={sopType}
            onFieldChange={handleFieldChange}
            onNext={handleNextSection}
            onPrev={handlePrevSection}
          />
        )}

        {activeView === "preview" && (
          <PreviewPanel data={currentData} brand={brand} sopType={sopType} />
        )}

      </div>

      <ExportBar data={currentData} brand={brand} setBrand={setBrand} sopType={sopType} />
    </div>
  );
}
