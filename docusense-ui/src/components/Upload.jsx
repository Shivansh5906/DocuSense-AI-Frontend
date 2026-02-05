import { useState } from "react";
import api from "../api/client";

export default function Upload({ onUploadDone }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      await api.post("/documents/upload", formData, {
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        },
      });

      onUploadDone(file.name);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card upload-card">
      <h2>Upload your document</h2>

      <label className="file-box">
        <input
          type="file"
          hidden
          onChange={(e) => setFile(e.target.files[0])}
        />
        <span>{file ? file.name : "Choose a file"}</span>
      </label>

      <button className="primary-btn" onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Upload"}
      </button>

      {progress > 0 && (
        <div className="progress">
          <div style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
