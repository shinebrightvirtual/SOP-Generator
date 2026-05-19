import { useState, useRef } from "react";
import { S } from "../styles/theme.js";
import { extractSOPFromTranscript } from "../lib/ai-extract.js";
import { fetchLoomTranscript, transcribeVideoFile } from "../lib/transcribe.js";

export default function VideoImportPanel({ onTranscriptReady, isPro }) {
  const [loomUrl, setLoomUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const processTranscript = async (transcript) => {
    setStatus("analyzing");
    setProgress(50);
    const parsed = await extractSOPFromTranscript(transcript);
    setProgress(100);
    setStatus("done");
    await new Promise(r => setTimeout(r, 600));
    onTranscriptReady(parsed);
  };

  const handleLoomSubmit = async () => {
    if (!loomUrl.trim()) return;
    setError("");
    setProcessing(true);
    setStatus("transcribing");
    setProgress(15);
    try {
      const transcript = await fetchLoomTranscript(loomUrl);
      await processTranscript(transcript);
    } catch (err) {
      setError(err.message || "Failed to process Loom video. Please try again.");
      setProcessing(false);
      setStatus("");
      setProgress(0);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setProcessing(true);
    setStatus("transcribing");
    setProgress(15);
    try {
      const transcript = await transcribeVideoFile(file);
      await processTranscript(transcript);
    } catch (err) {
      setError(err.message || "Failed to transcribe video. Please try again.");
      setProcessing(false);
      setStatus("");
      setProgress(0);
    }
  };

  return (
    <div style={S.videoCard}>
      <div style={S.videoCardPattern} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontSize: "20px" }}>🎥</span>
          <div style={S.secNum("#E8985E")}>AI-Powered Import</div>
          <span style={{ ...S.badge, ...S.proBadge }}>Pro</span>
        </div>
        <h3 style={{ ...S.secTitle, fontSize: "17px", marginBottom: "4px" }}>Start from a Video</h3>
        <p style={{ fontSize: "12px", color: "#918B82", margin: "0 0 16px", lineHeight: 1.5 }}>
          Paste a Loom link or upload a screen recording. AI will watch, transcribe, and draft your entire SOP — then you review each section.
        </p>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(200,80,80,0.08)", color: "#C85050", fontSize: "12px", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        {!processing ? (
          <>
            {!isPro ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: "13px", color: "#918B82", marginBottom: "10px" }}>Video import is a Pro feature</div>
                <div style={{ fontSize: "11px", color: "#B5AFA6" }}>Toggle Pro mode above to try it</div>
              </div>
            ) : (
              <>
                <div style={S.videoInputRow}>
                  <input
                    style={S.videoInput}
                    placeholder="Paste Loom link here... (e.g., https://www.loom.com/share/...)"
                    value={loomUrl}
                    onChange={e => setLoomUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLoomSubmit()}
                  />
                  <button style={S.videoBtn("primary")} onClick={handleLoomSubmit}>
                    ✦ Analyze
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "12px 0" }}>
                  <div style={{ flex: 1, height: "1px", background: "#E8E4DD" }} />
                  <span style={S.orDivider}>OR</span>
                  <div style={{ flex: 1, height: "1px", background: "#E8E4DD" }} />
                </div>
                <input type="file" ref={fileRef} accept="video/*" style={{ display: "none" }} onChange={handleFileUpload} />
                <button style={S.uploadVideoBtn} onClick={() => fileRef.current?.click()}>
                  📁 Upload a video file
                </button>
              </>
            )}
          </>
        ) : (
          <div>
            <div style={S.progressBar}>
              <div style={S.progressFill(progress)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {status !== "done" && (
                <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
              )}
              {status !== "done" && <div style={S.processingPulse} />}
              {status === "done" && <span style={{ fontSize: "16px" }}>✅</span>}
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#5C5C5C" }}>
                {status === "transcribing" && "Transcribing video..."}
                {status === "analyzing" && "AI is analyzing & drafting your SOP..."}
                {status === "done" && "SOP draft ready! Loading review..."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
