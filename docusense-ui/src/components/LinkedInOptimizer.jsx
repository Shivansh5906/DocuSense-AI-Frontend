import { useState, useEffect } from "react";
import api from "../api/client";

export default function LinkedInOptimizer({ documents = [], selectedFilename }) {
  const [targetTitle, setTargetTitle] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [optimizedProfile, setOptimizedProfile] = useState(null);

  // Fetch tailored resume versions when selected file changes
  useEffect(() => {
    setOptimizedProfile(null);
    setError("");
    if (selectedFilename) {
      fetchVersions(selectedFilename);
    } else {
      setVersions([]);
      setSelectedVersionId("");
    }
  }, [selectedFilename]);

  const fetchVersions = async (filename) => {
    try {
      const res = await api.get("/resume/versions", { params: { filename } });
      if (res.data && res.data.versions) {
        setVersions(res.data.versions);
      }
    } catch (err) {
      console.error("Failed to load versions for optimizer", err);
    }
  };

  const handleOptimize = async () => {
    if (!selectedFilename) {
      setError("Please select a base resume in the sidebar first.");
      return;
    }

    setLoading(true);
    setError("");
    setOptimizedProfile(null);

    try {
      const res = await api.post("/resume/linkedin", {
        filename: selectedFilename,
        target_title: targetTitle || null,
        industry: targetIndustry || null,
        resume_version_id: selectedVersionId ? parseInt(selectedVersionId, 10) : null
      });
      setOptimizedProfile(res.data);
    } catch (err) {
      console.error("LinkedIn optimization failed", err);
      setError(
        err.response?.data?.detail || 
        "Failed to generate LinkedIn details. Please check your backend and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text);
    alert(message || "Copied to clipboard!");
  };

  return (
    <div className="linkedin-optimizer-container animate-fade-in">
      <div className="optimizer-header" style={{ marginBottom: "24px" }}>
        <h2>🔗 AI LinkedIn Profile Optimizer</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Enhance your professional brand, increase SEO search visibility, and hook recruiter attention on LinkedIn.
        </p>
      </div>

      {!optimizedProfile && !loading && (
        <div className="form-workspace-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
          <div className="analyzer-setup-card card" style={{ padding: "24px", background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: "12px" }}>
            <h3>Configure LinkedIn Optimization</h3>
            
            <div className="input-group" style={{ marginBottom: "15px" }}>
              <label>Select Base Resume</label>
              {documents.length === 0 ? (
                <div className="no-resumes-warning">
                  ⚠️ Please upload a resume using the sidebar first.
                </div>
              ) : (
                <select 
                  value={selectedFilename || ""} 
                  onChange={() => {}} // Controlled by App selection
                  className="form-select"
                  disabled
                  style={{ opacity: 0.8 }}
                >
                  {documents.map((doc, idx) => (
                    <option key={idx} value={doc.filename}>{doc.filename}</option>
                  ))}
                </select>
              )}
            </div>

            {versions.length > 0 && (
              <div className="input-group" style={{ marginBottom: "15px" }}>
                <label>Target Tailored Version (Optional)</label>
                <select
                  value={selectedVersionId}
                  onChange={(e) => setSelectedVersionId(e.target.value)}
                  className="form-select"
                >
                  <option value="">Original Base Text</option>
                  {versions.map((ver) => (
                    <option key={ver.id} value={ver.id.toString()}>
                      📄 {ver.version_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="input-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "15px" }}>
              <div className="input-group">
                <label>Target Title (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Senior React Developer" 
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <label>Target Industry / Tech Domain</label>
                <input 
                  type="text" 
                  placeholder="e.g. Fintech, Cloud Computing" 
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <button 
              onClick={handleOptimize} 
              disabled={documents.length === 0}
              className="cta-primary-btn"
              style={{ width: "100%", marginTop: "10px", padding: "12px", borderRadius: "8px", fontWeight: "600", fontSize: "1rem" }}
            >
              ✨ Optimize Profile Brand
            </button>

            {error && (
              <div className="error-banner" style={{ marginTop: "15px" }}>
                <p>{error}</p>
              </div>
            )}
          </div>

          <div className="instruction-info-card card" style={{ padding: "24px", background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: "12px" }}>
            <h3>LinkedIn Branding Secrets</h3>
            <div className="info-bullets">
              <div className="info-bullet" style={{ display: "flex", gap: "12px", marginBottom: "15px" }}>
                <div className="bullet-number" style={{ background: "var(--primary-gradient)", color: "#fff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyCenter: "center", flexShrink: 0, fontSize: "0.85rem", fontWeight: "600" }}>1</div>
                <div className="bullet-desc">
                  <strong>Headline SEO:</strong> The LinkedIn algorithm heavily indexes headline keywords. Use specific tech terms separated by pipes to stand out in recruiter search results.
                </div>
              </div>
              <div className="info-bullet" style={{ display: "flex", gap: "12px", marginBottom: "15px" }}>
                <div className="bullet-number" style={{ background: "var(--primary-gradient)", color: "#fff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyCenter: "center", flexShrink: 0, fontSize: "0.85rem", fontWeight: "600" }}>2</div>
                <div className="bullet-desc">
                  <strong>The First 3 Lines:</strong> Only the first 220 characters of your "About" section are shown before visitors click "See More". Hook them immediately.
                </div>
              </div>
              <div className="info-bullet" style={{ display: "flex", gap: "12px" }}>
                <div className="bullet-number" style={{ background: "var(--primary-gradient)", color: "#fff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyCenter: "center", flexShrink: 0, fontSize: "0.85rem", fontWeight: "600" }}>3</div>
                <div className="bullet-desc">
                  <strong>Skim-Read Experience:</strong> Recruiter attention spans are limited. Keep bullet points brief and highlight metrics-driven results.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-card" style={{ textAlign: "center", padding: "40px", background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: "12px" }}>
          <div className="double-bounce-spinner">
            <div className="double-bounce1"></div>
            <div className="double-bounce2"></div>
          </div>
          <h3>Running AI Profile Tuning...</h3>
          <p className="loading-subtext">Structuring catchy headlines, writing first-person About summaries, and adapting experience records...</p>
        </div>
      )}

      {optimizedProfile && !loading && (
        <div className="optimized-results animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>📄 Profile: {selectedFilename}</span>
            <button className="secondary-btn" onClick={() => setOptimizedProfile(null)}>
              ← Back to Configuration
            </button>
          </div>

          {/* 1. Headlines Options */}
          <div className="card" style={{ padding: "20px", background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: "12px" }}>
            <h3 style={{ margin: "0 0 15px 0" }}>⚡ Generated Headline Alternatives</h3>
            <div className="headlines-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {optimizedProfile.headlines.map((headline, idx) => (
                <div key={idx} className="nested-item-card" style={{ background: "rgba(0, 0, 0, 0.02)", border: "1px solid var(--border-glass)", padding: "16px", borderRadius: "8px", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontSize: "0.75rem", padding: "2px 6px", background: "var(--primary-gradient)", borderRadius: "4px", fontWeight: "600", color: "#fff" }}>Option {idx + 1}</span>
                    <button 
                      className="copy-btn" 
                      onClick={() => copyToClipboard(headline, "Headline copied!")}
                      style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--primary-light)", fontSize: "0.85rem" }}
                    >
                      📋 Copy
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.4", color: "var(--text-main)", fontWeight: "500" }}>{headline}</p>
                </div>
              ))}
            </div>
          </div>

          {/* About Section & Experience Split */}
          <div className="split-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
            <div className="card" style={{ padding: "20px", background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: 0 }}>✍️ Optimized First-Person 'About' section</h3>
                <button 
                  className="copy-btn" 
                  onClick={() => copyToClipboard(optimizedProfile.about, "About text copied!")}
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--primary-light)", fontSize: "0.85rem", fontWeight: "600" }}
                >
                  📋 Copy section
                </button>
              </div>
              <div className="doc-content-display" style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", maxHeight: "400px", overflowY: "auto", border: "1px solid var(--border-glass)" }}>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.9rem", color: "var(--text-main)", margin: 0, lineHeight: "1.5" }}>{optimizedProfile.about}</pre>
              </div>
            </div>

            <div className="card" style={{ padding: "20px", background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: 0 }}>📊 Experience & Skimming Recommendations</h3>
                <button 
                  className="copy-btn" 
                  onClick={() => copyToClipboard(optimizedProfile.experience_tips, "Tips copied!")}
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--primary-light)", fontSize: "0.85rem", fontWeight: "600" }}
                >
                  📋 Copy advice
                </button>
              </div>
              <div className="doc-content-display" style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", maxHeight: "400px", overflowY: "auto", border: "1px solid var(--border-glass)" }}>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.9rem", color: "var(--text-main)", margin: 0, lineHeight: "1.5" }}>{optimizedProfile.experience_tips}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
