import { useState, useRef } from "react";
import { S, colors } from "../styles/theme.js";
import { extractSOPFromTranscript } from "../lib/ai-extract.js";
import { fetchLoomTranscript, transcribeVideoFile } from "../lib/transcribe.js";

export default function VideoImportPanel({ onTranscriptReady }) {
  const [loomUrl, setLoomUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
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
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", width: "100%", textAlign: "left" }}
        >
          <span style={{ fontSize: "18px", color: colors.accent, fontWeight: 700 }}>+</span>
          <div style={{ flex: 1 }}>
            <div style={{ ...S.secNum(colors.accent), marginBottom: 0 }}>AI-Powered Import</div>
            <div style={{ fontSize: "12px", color: colors.textMuted }}>Got a Loom or screen recording? Let AI draft your SOP automatically.</div>
          </div>
          <span style={{ fontSize: "12px", color: colors.textFaint }}>{expanded ? "▲" : "▼"}</span>
        </button>

        {expanded && (
          <div style={{ marginTop: "14px" }}>
            {error && (
              <div style={{ padding: "10px 14px", borderRadius: "8px", background: colors.dangerBg, color: colors.danger, fontSize: "12px", marginBottom: "12px" }}>
                {error}
              </div>
            )}

            {!processing ? (
              <>
                <div style={S.videoInputRow}>
                  <input
                    style={S.videoInput}
                    placeholder="Paste Loom link here…"
                    value={loomUrl}
                    onChange={e => setLoomUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLoomSubmit()}
                  />
                  <button style={S.videoBtn("primary")} onClick={handleLoomSubmit}>
                    Analyze
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "12px 0" }}>
                  <div style={{ flex: 1, height: "1px", background: colors.border }} />
                  <span style={S.orDivider}>OR</span>
                  <div style={{ flex: 1, height: "1px", background: colors.border }} />
                </div>
                <input type="file" ref={fileRef} accept="video/*" style={{ display: "none" }} onChange={handleFileUpload} />
                <button style={S.uploadVideoBtn} onClick={() => fileRef.current?.click()}>
                  Upload a video file
                </button>
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
                  {status === "done" && <span style={{ fontSize: "13px", fontWeight: 700, color: "#22a06b" }}>Done</span>}
                  <span style={{ fontSize: "13px", fontWeight: 500, color: colors.textSecondary }}>
                    {status === "transcribing" && "Transcribing video..."}
                    {status === "analyzing" && "AI is analyzing & drafting your SOP..."}
                    {status === "done" && "SOP draft ready! Loading review..."}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
