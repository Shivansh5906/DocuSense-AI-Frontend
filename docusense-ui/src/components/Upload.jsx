import { useState, useRef } from "react";
import api from "../api/client";

export default function Upload({ onUploadDone }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setProgress(5); // Start progress indication

      await api.post("/documents/upload", formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            // Cap at 95% until backend actually returns success
            setProgress(Math.min(percent, 95));
          }
        },
      });

      setProgress(100);
      setTimeout(() => {
        onUploadDone(file.name);
        setFile(null);
        setProgress(0);
      }, 600);
    } catch (err) {
      console.error(err);
      alert("Document upload failed. Make sure the backend is running.");
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="file-box">
        <input
          type="file"
          ref={fileInputRef}
          hidden
          onChange={handleFileChange}
          accept=".pdf,.docx"
          disabled={loading}
        />
        <div className="file-box-icon">📤</div>
        <span>{file ? file.name : "Select PDF or Word doc"}</span>
      </label>

      {file && (
        <button className="primary-btn" onClick={handleUpload} disabled={loading}>
          {loading ? "Processing..." : "Ingest Document"}
        </button>
      )}

      {progress > 0 && (
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
