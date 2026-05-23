/**
 * Video Transcription
 *
 * Handles two input methods:
 * 1. Loom links — fetches transcript via Loom API
 * 2. Uploaded videos — sends to Deepgram or Whisper for transcription
 *
 * In production, both should go through serverless functions.
 */

/**
 * Extract Loom video ID from a URL
 */
export function parseLoomUrl(url) {
  // Handles:
  //   https://www.loom.com/share/abc123...
  //   https://loom.com/share/abc123...
  //   https://www.loom.com/embed/abc123...
  const match = url.match(
    /loom\.com\/(?:share|embed)\/([a-f0-9]+)/i
  );
  return match ? match[1] : null;
}

/**
 * Validate that a URL looks like a Loom link
 */
export function isLoomUrl(url) {
  return /loom\.com\/(?:share|embed)\//i.test(url);
}

/**
 * Fetch transcript from a Loom video
 *
 * PRODUCTION: Should call /api/transcribe-loom serverless function
 *
 * Loom API docs: https://developers.loom.com/
 * Endpoint: GET /v1/videos/{id}/transcript
 */
export async function fetchLoomTranscript(loomUrl) {
  const videoId = parseLoomUrl(loomUrl);
  if (!videoId) {
    throw new Error("Invalid Loom URL. Expected format: https://www.loom.com/share/...");
  }

  // Production: call serverless function
  const response = await fetch("/api/transcribe-loom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Loom transcript: ${response.statusText}`);
  }

  const data = await response.json();
  return data.transcript;
}

/**
 * Transcribe an uploaded video file
 *
 * PRODUCTION: Should call /api/transcribe-video serverless function
 * Uses Deepgram or OpenAI Whisper on the backend
 *
 * @param {File} videoFile — the uploaded video file
 * @returns {string} — the transcript text
 */
export async function transcribeVideoFile(videoFile) {
  // Validate file
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (videoFile.size > maxSize) {
    throw new Error("Video file is too large. Maximum size is 500MB.");
  }

  const validTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
  ];
  if (!validTypes.includes(videoFile.type)) {
    throw new Error(
      "Unsupported video format. Please upload MP4, WebM, MOV, AVI, or MKV."
    );
  }

  // Upload to serverless function
  const formData = new FormData();
  formData.append("video", videoFile);

  const response = await fetch("/api/transcribe-video", {
    method: "POST",
    body: formData,
  });

  if (response.status === 503) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Video transcription isn't set up yet. A DEEPGRAM_API_KEY needs to be added to Vercel to enable this feature.");
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Transcription failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.transcript;
}

/**
 * Main entry point — handles either input method
 */
export async function getTranscript({ loomUrl, videoFile }) {
  if (loomUrl) {
    return fetchLoomTranscript(loomUrl);
  }
  if (videoFile) {
    return transcribeVideoFile(videoFile);
  }
  throw new Error("No input provided. Please paste a Loom link or upload a video.");
}
