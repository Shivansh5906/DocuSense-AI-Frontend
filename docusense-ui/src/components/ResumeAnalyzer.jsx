import { useState, useEffect } from "react";
import api from "../api/client";
import "./ResumeAnalyzer.css";

export default function ResumeAnalyzer({ documents: allDocs = [], selectedFilename, setSelectedFilename, forceTab, onUploadDone }) {
  const [jdText, setJdText] = useState("");
  const [jdTitle, setJdTitle] = useState("");
  const [jdCompany, setJdCompany] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [activeReportTab, setActiveReportTab] = useState("jd_match"); // "jd_match", "gaps", "ats", "interview", "rewriter", "cover_letter"
  const [viewMode, setViewMode] = useState("create"); // "create" or "history"

  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInlineUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadLoading(true);
      setUploadProgress(10);

      await api.post("/documents/upload", formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(Math.min(percent, 95));
          }
        },
      });

      setUploadProgress(100);
      
      if (onUploadDone) {
        onUploadDone(file.name);
      }
      
      setTimeout(async () => {
        setUploadProgress(0);
        setUploadLoading(false);
        
        setLoading(true);
        setError("");
        setReport(null);

        try {
          const res = await api.post("/resume/analyze", {
            filename: file.name,
            jd_text: jdText,
            jd_title: jdTitle,
            jd_company: jdCompany,
            resume_version_id: null
          });
          
          setReport(res.data);
          if (res.data.roadmap) {
            setRoadmapItems(res.data.roadmap);
          } else {
            setRoadmapItems([]);
          }
          fetchHistory();
          setActiveReportTab("ats");
        } catch (err) {
          console.error("Auto analysis failed", err);
          setError(
            err.response?.data?.detail || 
            "Failed to complete resume analysis. Please verify your Gemini API key and try again."
          );
        } finally {
          setLoading(false);
        }
      }, 1000);

    } catch (err) {
      console.error("Inline upload failed", err);
      alert("Resume upload failed. Please make sure the file is a valid PDF or DOCX.");
      setUploadProgress(0);
      setUploadLoading(false);
    }
  };

  useEffect(() => {
    if (forceTab) {
      setActiveReportTab(forceTab);
    }
  }, [forceTab]);

  const [coverLetterReport, setCoverLetterReport] = useState(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [coverLetterTone, setCoverLetterTone] = useState("professional");
  const [coverLetterError, setCoverLetterError] = useState("");
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState("");
  const [newVersionText, setNewVersionText] = useState("");
  const [editingVersionId, setEditingVersionId] = useState(null);
  const [editingVersionText, setEditingVersionText] = useState("");
  const [showEditorPanel, setShowEditorPanel] = useState(false);
  const [roadmapItems, setRoadmapItems] = useState([]);

  // Filter PDF and DOCX files for resume selection, ensuring they are valid and fully completed
  const documents = allDocs.filter(doc => {
    const ext = doc.filename.split(".").pop().toLowerCase();
    return (ext === "pdf" || ext === "docx") && doc.status === "completed";
  });

  // Auto-select first resume if none is selected
  useEffect(() => {
    if (documents.length > 0 && !selectedFilename) {
      setSelectedFilename(documents[0].filename);
    }
  }, [documents, selectedFilename, setSelectedFilename]);

  // Reset report, error, and view mode when selected file changes, returning to the main setup page
  useEffect(() => {
    setReport(null);
    setError("");
    setViewMode("create");
    setCoverLetterReport(null);
    setCoverLetterError("");
    setEditingVersionId(null);
    setEditingVersionText("");
    setShowEditorPanel(false);
    
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
      console.error("Failed to fetch versions", err);
    }
  };

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/resume/history");
      if (res.data && res.data.history) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error("Failed to fetch analysis history", err);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFilename) {
      setError("Please select a resume first.");
      return;
    }
    
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const res = await api.post("/resume/analyze", {
        filename: selectedFilename,
        jd_text: jdText,
        jd_title: jdTitle,
        jd_company: jdCompany,
        resume_version_id: selectedVersionId ? parseInt(selectedVersionId, 10) : null
      });
      
      setReport(res.data);
      if (res.data.roadmap) {
        setRoadmapItems(res.data.roadmap);
      } else {
        setRoadmapItems([]);
      }
      // Refresh history list
      fetchHistory();
      // Auto-set report tab
      if (jdText.trim()) {
        setActiveReportTab("jd_match");
      } else {
        setActiveReportTab("ats");
      }
    } catch (err) {
      console.error("Analysis failed", err);
      setError(
        err.response?.data?.detail || 
        "Failed to complete resume analysis. Please verify your Gemini API key and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryReport = async (analysisId) => {
    setLoading(true);
    setError("");
    setReport(null);
    setCoverLetterReport(null);
    setCoverLetterError("");
    try {
      const res = await api.get(`/resume/analysis/${analysisId}`);
      setReport(res.data);
      if (res.data.roadmap) {
        setRoadmapItems(res.data.roadmap);
      } else {
        setRoadmapItems([]);
      }
      setViewMode("create"); // Return to report view
      if (res.data.jd_text) {
        setActiveReportTab("jd_match");
      } else {
        setActiveReportTab("ats");
      }
    } catch (err) {
      console.error("Failed to load historical report", err);
      setError("Failed to load the historical report details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!newVersionName.trim()) {
      alert("Please enter a version name.");
      return;
    }
    try {
      const res = await api.post("/resume/versions", {
        filename: selectedFilename,
        version_name: newVersionName,
        tailored_text: newVersionText
      });
      alert(res.data.message);
      setShowVersionModal(false);
      setNewVersionName("");
      setNewVersionText("");
      await fetchVersions(selectedFilename);
      setSelectedVersionId(res.data.version_id.toString());
    } catch (err) {
      console.error("Failed to create version", err);
      alert("Failed to create tailored version.");
    }
  };

  const handleUpdateVersion = async () => {
    if (!editingVersionId) return;
    try {
      await api.put(`/resume/versions/${editingVersionId}`, {
        tailored_text: editingVersionText
      });
      alert("Tailored resume text saved successfully!");
      setVersions(prev => 
        prev.map(v => v.id === editingVersionId ? { ...v, tailored_text: editingVersionText } : v)
      );
      setShowEditorPanel(false);
      setEditingVersionId(null);
    } catch (err) {
      console.error("Failed to update version", err);
      alert("Failed to save changes.");
    }
  };

  const handleDeleteVersion = async (versionId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this version?")) return;
    try {
      await api.delete(`/resume/versions/${versionId}`);
      if (selectedVersionId === versionId.toString()) {
        setSelectedVersionId("");
      }
      await fetchVersions(selectedFilename);
    } catch (err) {
      console.error("Failed to delete version", err);
      alert("Failed to delete version.");
    }
  };

  const handleToggleRoadmapItem = async (itemId, currentStatus) => {
    const nextStatus = currentStatus === "completed" ? "missing" : "completed";
    setRoadmapItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, status: nextStatus } : item)
    );
    try {
      await api.put(`/resume/roadmap/${itemId}`, { status: nextStatus });
    } catch (err) {
      console.error("Failed to toggle roadmap status", err);
      setRoadmapItems(prev =>
        prev.map(item => item.id === itemId ? { ...item, status: currentStatus } : item)
      );
    }
  };

  const calculateProjectedScore = () => {
    if (!report || report.match_score === null || report.match_score === undefined) return 0;
    const baseScore = report.match_score;
    if (!roadmapItems || roadmapItems.length === 0) return baseScore;
    
    const completedCount = roadmapItems.filter(item => item.status === "completed").length;
    const totalCount = roadmapItems.length;
    
    const potentialGain = 100 - baseScore;
    const projected = baseScore + (completedCount / totalCount) * potentialGain;
    return Math.round(projected);
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedFilename || !jdText) return;
    
    setGeneratingCoverLetter(true);
    setCoverLetterError("");
    try {
      const res = await api.post("/resume/cover-letter", {
        filename: selectedFilename,
        jd_text: jdText,
        jd_title: jdTitle,
        jd_company: jdCompany,
        tone: coverLetterTone
      });
      setCoverLetterReport(res.data);
    } catch (err) {
      console.error("Failed to generate cover letter", err);
      setCoverLetterError(
        err.response?.data?.detail || "An error occurred while generating the cover letter."
      );
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const clearInputs = () => {
    setJdText("");
    setJdTitle("");
    setJdCompany("");
    setReport(null);
    setError("");
    setCoverLetterReport(null);
    setCoverLetterError("");
  };

  return (
    <div className="resume-analyzer-container">
      {/* View Toggle Header */}
      <div className="analyzer-header">
        <h2>Resume & CV Optimization Hub</h2>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === "create" ? "active" : ""}`}
            onClick={() => setViewMode("create")}
          >
            📊 Analyze & Report
          </button>
          <button 
            className={`toggle-btn ${viewMode === "history" ? "active" : ""}`}
            onClick={() => {
              setViewMode("history");
              fetchHistory();
            }}
          >
            ⏳ Analysis History ({history.length})
          </button>
        </div>
      </div>

      {viewMode === "history" ? (
        <div className="history-section">
          {history.length === 0 ? (
            <div className="empty-history-card">
              <span className="empty-icon">📂</span>
              <h3>No Analysis Reports Found</h3>
              <p>You haven't analyzed any resumes yet. Head over to the 'Analyze & Report' tab to get started!</p>
              <button className="primary-btn-action" onClick={() => setViewMode("create")}>
                Start New Analysis
              </button>
            </div>
          ) : (
            <div className="history-grid">
              {history.map((h) => (
                <div key={h.id} className="history-card">
                  <div className="card-top">
                    <span className="file-badge">📄 {h.filename}</span>
                    {h.match_score !== null && (
                      <span className="score-badge">
                        Match: {h.match_score.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <h3>{h.jd_title || "General CV Evaluation"}</h3>
                  <p className="company-text">{h.jd_company || "General Audit"}</p>
                  <p className="date-text">Analyzed on {new Date(h.created_at).toLocaleDateString()}</p>
                  <button 
                    className="view-report-btn"
                    onClick={() => loadHistoryReport(h.id)}
                  >
                    View Detailed Report ➔
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="main-analyzer-workspace">
          {/* If loading, show modern loader */}
          {loading && (
            <div className="loading-card">
              <div className="double-bounce-spinner">
                <div className="double-bounce1"></div>
                <div className="double-bounce2"></div>
              </div>
              <h3>Analyzing Resume Details...</h3>
              <p className="loading-subtext">Advanced AI is matching skills, auditing ATS formatting, scoring keyword density, and preparing interview questions...</p>
            </div>
          )}

          {/* If error, show error banner */}
          {error && (
            <div className="error-banner">
              <div className="error-icon">⚠️</div>
              <div className="error-msg-content">
                <h4>Analysis Request Failed</h4>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Setup / Form State */}
          {!loading && !report && (
            <div className="form-workspace-grid">
              <form onSubmit={handleAnalyze} className="analyzer-setup-card">
                <h3>Configure Analysis</h3>
                
                {/* Inline Upload Zone */}
                <div className="inline-upload-box">
                  <label className="inline-upload-dropzone">
                    <input 
                      type="file" 
                      accept=".pdf,.docx" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleInlineUpload(e.target.files[0]);
                        }
                      }}
                      hidden
                      disabled={uploadLoading}
                    />
                    <div className="dropzone-content">
                      <span className="dropzone-icon">📤</span>
                      <strong>Upload Resume to Check Score</strong>
                      <p>Drag and drop or click to choose a PDF or DOCX file</p>
                    </div>
                  </label>
                  {uploadLoading && (
                    <div className="inline-progress-wrapper" style={{ marginTop: "12px" }}>
                      <div className="progress-text-label" style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px", textAlign: "left" }}>
                        Uploading: {uploadProgress}%
                      </div>
                      <div className="progress-bar-track" style={{ height: "6px", background: "rgba(15, 23, 42, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
                        <div className="progress-bar-fill" style={{ width: `${uploadProgress}%`, height: "100%", background: "var(--success)", transition: "width 0.2s ease" }}></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="input-group" style={{ marginTop: "20px" }}>
                  <label htmlFor="resume-select">Or Select Already Uploaded Resume</label>
                  {documents.length === 0 ? (
                    <div className="no-resumes-warning">
                      ⚠️ No resumes found in workspace. Upload a file above to begin.
                    </div>
                  ) : (
                    <>
                      <select 
                        id="resume-select"
                        value={selectedFilename || ""} 
                        onChange={(e) => setSelectedFilename(e.target.value)}
                        className="form-select"
                      >
                        <option value="" disabled>-- Select a resume --</option>
                        {documents.map((doc, idx) => (
                          <option key={idx} value={doc.filename}>{doc.filename}</option>
                        ))}
                      </select>
                      
                      {/* Version Controls */}
                      <div className="version-selector-container" style={{ marginTop: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Resume Target Version</label>
                          <button 
                            type="button" 
                            className="create-ver-btn"
                            style={{ background: "transparent", border: "none", color: "var(--primary-light)", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
                            onClick={() => {
                              setNewVersionName("");
                              setNewVersionText("");
                              setShowVersionModal(true);
                            }}
                          >
                            ➕ Clone to Tailor
                          </button>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <select
                            value={selectedVersionId}
                            onChange={(e) => setSelectedVersionId(e.target.value)}
                            className="form-select"
                            style={{ flex: 1 }}
                          >
                            <option value="">Original Base Text</option>
                            {versions.map((ver) => (
                              <option key={ver.id} value={ver.id.toString()}>
                                📄 {ver.version_name}
                              </option>
                            ))}
                          </select>
                          
                          {selectedVersionId && (
                            <>
                              <button
                                type="button"
                                className="action-ver-btn edit"
                                style={{ padding: "0 10px", background: "#374151", border: "1px solid var(--border-glass)", borderRadius: "6px", cursor: "pointer" }}
                                onClick={() => {
                                  const ver = versions.find(v => v.id.toString() === selectedVersionId);
                                  if (ver) {
                                    setEditingVersionId(ver.id);
                                    setEditingVersionText(ver.tailored_text);
                                    setShowEditorPanel(true);
                                  }
                                }}
                                title="Edit Tailored Text"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                className="action-ver-btn delete"
                                style={{ padding: "0 10px", background: "#991b1b", border: "1px solid var(--border-glass)", borderRadius: "6px", cursor: "pointer" }}
                                onClick={(e) => handleDeleteVersion(parseInt(selectedVersionId, 10), e)}
                                title="Delete Version"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="job-title">Job Title (Optional)</label>
                    <input 
                      id="job-title"
                      type="text" 
                      placeholder="e.g. Senior Frontend Engineer" 
                      value={jdTitle}
                      onChange={(e) => setJdTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="company-name">Company (Optional)</label>
                    <input 
                      id="company-name"
                      type="text" 
                      placeholder="e.g. Google, Inc." 
                      value={jdCompany}
                      onChange={(e) => setJdCompany(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="jd-textarea">Paste Job Description (Optional - For matching & gaps)</label>
                  <textarea 
                    id="jd-textarea"
                    placeholder="Paste the job description text here to get a matching score, detailed gap analysis, and tailored CV optimization suggestions..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    rows={8}
                    className="form-textarea"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={documents.length === 0}
                  className="analyze-submit-btn"
                >
                  🚀 Run AI Intelligence Review
                </button>
              </form>

              <div className="instruction-info-card">
                <h3>Powered by DocuSense AI</h3>
                <p>DocuSense Resume Suite utilizes advanced AI models with native JSON Structured Outputs for high-accuracy analysis.</p>
                
                <div className="info-bullets">
                  <div className="info-bullet">
                    <div className="bullet-number">1</div>
                    <div className="bullet-desc">
                      <strong>JD Match Score:</strong> Compares experience and project scopes directly with the target job profile.
                    </div>
                  </div>
                  <div className="info-bullet">
                    <div className="bullet-number">2</div>
                    <div className="bullet-desc">
                      <strong>Gap Analysis:</strong> Spots missing technology stack tags and provides tailored advice.
                    </div>
                  </div>
                  <div className="info-bullet">
                    <div className="bullet-number">3</div>
                    <div className="bullet-desc">
                      <strong>ATS Score Checker:</strong> Evaluates formatting issues, completeness, and keyword density.
                    </div>
                  </div>
                  <div className="info-bullet">
                    <div className="bullet-number">4</div>
                    <div className="bullet-desc">
                      <strong>Interview Prep:</strong> Automatically structures mock behavior and technical questions from your experience.
                    </div>
                  </div>
                  <div className="info-bullet">
                    <div className="bullet-number">5</div>
                    <div className="bullet-desc">
                      <strong>CV Bullet Point Rewriting:</strong> Optimizes weak phrasing into high-impact X-Y-Z metrics results.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report Display State */}
          {!loading && report && (
            <div className="report-workspace animate-fade-in">
              <div className="report-top-meta">
                <div>
                  <span className="active-file-tag">📄 Resume: {report.filename}</span>
                  <h3>
                    {report.jd_title && report.jd_company 
                      ? `${report.jd_title} at ${report.jd_company}` 
                      : "General Resume Intelligence Report"}
                  </h3>
                </div>
                <button className="secondary-btn-action" onClick={clearInputs}>
                  ← Back to Setup
                </button>
              </div>

              {/* Report Tab Switcher */}
              <div className="report-tabs">
                {report.match_score !== null && (
                  <button 
                    className={`report-tab-btn ${activeReportTab === "jd_match" ? "active" : ""}`}
                    onClick={() => setActiveReportTab("jd_match")}
                  >
                    🎯 JD Matching Score
                  </button>
                )}
                {report.match_score !== null && (
                  <button 
                    className={`report-tab-btn ${activeReportTab === "gaps" ? "active" : ""}`}
                    onClick={() => setActiveReportTab("gaps")}
                  >
                    🔍 Gap Analysis
                  </button>
                )}
                <button 
                  className={`report-tab-btn ${activeReportTab === "ats" ? "active" : ""}`}
                  onClick={() => setActiveReportTab("ats")}
                >
                  ⚡ ATS Score & Checker
                </button>
                <button 
                  className={`report-tab-btn ${activeReportTab === "interview" ? "active" : ""}`}
                  onClick={() => setActiveReportTab("interview")}
                >
                  💬 Mock Interview Prep
                </button>
                <button 
                  className={`report-tab-btn ${activeReportTab === "rewriter" ? "active" : ""}`}
                  onClick={() => setActiveReportTab("rewriter")}
                >
                  ✏️ Bullet point Rewriter
                </button>
                <button 
                  className={`report-tab-btn ${activeReportTab === "cover_letter" ? "active" : ""}`}
                  onClick={() => setActiveReportTab("cover_letter")}
                >
                  ✉️ Cover Letter & Outreach
                </button>
                {roadmapItems && roadmapItems.length > 0 && (
                  <button 
                    className={`report-tab-btn ${activeReportTab === "roadmap" ? "active" : ""}`}
                    onClick={() => setActiveReportTab("roadmap")}
                  >
                    🛣️ Skills Roadmap
                  </button>
                )}
              </div>

              {/* Report Content Panels */}
              <div className="report-content-panel">
                
                {/* 1. JD MATCH TAB */}
                {activeReportTab === "jd_match" && report.match_score !== null && (
                  <div className="tab-pane jd-match-pane">
                    <div className="score-header-grid">
                      <div className="circle-score-box">
                        <div 
                          className="circle-score" 
                          style={{
                            "--score-percent": `${report.match_score}%`,
                            "--score-color": report.match_score >= 80 ? "#10b981" : report.match_score >= 50 ? "#f59e0b" : "#ef4444"
                          }}
                        >
                          <div className="circle-score-inner">
                            <span className="percentage-number">{report.match_score.toFixed(0)}%</span>
                            <span className="percentage-label">JD Match</span>
                          </div>
                        </div>
                      </div>
                      <div className="score-summary-details">
                        <h4>AI Matching Report</h4>
                        <p>{report.reasoning || "Evaluation of alignment finished successfully."}</p>
                        
                        <div className="meta-skills-count">
                          <span>✅ <strong>{report.gap_analysis?.matching_skills?.length || 0}</strong> Matching Skills</span>
                          <span>⚠️ <strong>{report.gap_analysis?.missing_skills?.length || 0}</strong> Critical Skills Missing</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-cards-grid">
                      <div className="detail-card info-card-success">
                        <h4>Key Strengths</h4>
                        <ul>
                          {report.gap_analysis?.strengths?.map((str, idx) => (
                            <li key={idx}>⭐ {str}</li>
                          ))}
                          {(!report.gap_analysis?.strengths || report.gap_analysis.strengths.length === 0) && (
                            <li>No specific strengths recorded.</li>
                          )}
                        </ul>
                      </div>
                      <div className="detail-card info-card-warning">
                        <h4>Tailoring Recommendations</h4>
                        <ul>
                          {report.gap_analysis?.tailoring_recommendations?.map((rec, idx) => (
                            <li key={idx}>💡 {rec}</li>
                          ))}
                          {(!report.gap_analysis?.tailoring_recommendations || report.gap_analysis.tailoring_recommendations.length === 0) && (
                            <li>No tailoring recommendations needed.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. GAP ANALYSIS TAB */}
                {activeReportTab === "gaps" && report.match_score !== null && (
                  <div className="tab-pane gaps-pane">
                    <h3>Technology Stack & Skills Gap Audit</h3>
                    <p className="pane-intro">The following analysis evaluates how well your resume matches the hard and soft skills requested in the job description.</p>
                    
                    <div className="skills-split-grid">
                      <div className="skills-column matching-column">
                        <h4>Matching Credentials ({report.gap_analysis?.matching_skills?.length || 0})</h4>
                        <div className="skills-bubble-container">
                          {report.gap_analysis?.matching_skills?.map((s, idx) => (
                            <span key={idx} className="skill-pill pill-match">{s}</span>
                          ))}
                          {(!report.gap_analysis?.matching_skills || report.gap_analysis.matching_skills.length === 0) && (
                            <p className="no-skills-notice">No direct matches identified in the description.</p>
                          )}
                        </div>
                      </div>

                      <div className="skills-column missing-column">
                        <h4>Missing / Weak Skills ({report.gap_analysis?.missing_skills?.length || 0})</h4>
                        <div className="skills-bubble-container">
                          {report.gap_analysis?.missing_skills?.map((s, idx) => (
                            <span key={idx} className="skill-pill pill-missing">{s}</span>
                          ))}
                          {(!report.gap_analysis?.missing_skills || report.gap_analysis.missing_skills.length === 0) && (
                            <p className="no-skills-notice">Perfect match! No critical missing skills detected.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="additional-gap-details">
                      <h4>How to Bridge the Gaps</h4>
                      <p>Modify your CV summary or experience descriptors to incorporate the missing technologies. If you have experience with equivalent tools (e.g. Azure instead of AWS), explicitly mention those equivalent technologies to gain partial keyword compliance.</p>
                    </div>
                  </div>
                )}

                {/* 3. ATS SCORE TAB */}
                {activeReportTab === "ats" && (
                  <div className="tab-pane ats-pane">
                    <div className="score-header-grid">
                      <div className="circle-score-box">
                        <div 
                          className="circle-score" 
                          style={{
                            "--score-percent": `${report.ats_report?.ats_score || 0}%`,
                            "--score-color": (report.ats_report?.ats_score || 0) >= 80 ? "#10b981" : (report.ats_report?.ats_score || 0) >= 50 ? "#f59e0b" : "#ef4444"
                          }}
                        >
                          <div className="circle-score-inner">
                            <span className="percentage-number">{(report.ats_report?.ats_score || 0).toFixed(0)}</span>
                            <span className="percentage-label">ATS Score</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ats-bars-grid">
                        <h4>ATS Checklist Compliance</h4>
                        <div className="bar-stat">
                          <div className="bar-labels">
                            <span>Formatting & Structure</span>
                            <span>{report.ats_report?.formatting_score || 0}%</span>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${report.ats_report?.formatting_score || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="bar-stat">
                          <div className="bar-labels">
                            <span>Keyword Density & Relevance</span>
                            <span>{report.ats_report?.keyword_density_score || 0}%</span>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${report.ats_report?.keyword_density_score || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="bar-stat">
                          <div className="bar-labels">
                            <span>Section Completeness</span>
                            <span>{report.ats_report?.completeness_score || 0}%</span>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${report.ats_report?.completeness_score || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ats-details-grid">
                      <div className="ats-detail-card">
                        <h4>Detected Sections</h4>
                        <div className="sections-container">
                          {report.ats_report?.detected_sections?.map((sec, idx) => (
                            <span key={idx} className="section-badge badge-found">✔ {sec}</span>
                          ))}
                          {report.ats_report?.missing_sections?.map((sec, idx) => (
                            <span key={idx} className="section-badge badge-missing">✖ Missing: {sec}</span>
                          ))}
                        </div>
                      </div>

                      <div className="ats-detail-card">
                        <h4>Formatting Issues ({report.ats_report?.formatting_issues?.length || 0})</h4>
                        {report.ats_report?.formatting_issues?.length === 0 ? (
                          <div className="compliance-passed">
                            <span>🎉</span> Excellent! No formatting issues detected that could block ATS parsers.
                          </div>
                        ) : (
                          <ul className="issues-list">
                            {report.ats_report?.formatting_issues?.map((issue, idx) => (
                              <li key={idx}>⚠ {issue}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {report.ats_report?.keyword_suggestions && report.ats_report.keyword_suggestions.length > 0 && (
                      <div className="keyword-suggestions-section">
                        <h4>Keyword Optimization Matrix</h4>
                        <table className="keywords-table">
                          <thead>
                            <tr>
                              <th>Recommended Keyword</th>
                              <th>Current Frequency</th>
                              <th>Target Frequency</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.ats_report.keyword_suggestions.map((k, idx) => {
                              const diff = k.recommended_frequency - k.frequency_in_resume;
                              return (
                                <tr key={idx}>
                                  <td><strong>{k.keyword}</strong></td>
                                  <td>{k.frequency_in_resume}</td>
                                  <td>{k.recommended_frequency}</td>
                                  <td>
                                    {diff <= 0 ? (
                                      <span className="status-badge match-ok">Optimal ✓</span>
                                    ) : (
                                      <span className="status-badge match-short">Add {diff} more times</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. MOCK INTERVIEW TAB */}
                {activeReportTab === "interview" && (
                  <div className="tab-pane interview-pane">
                    <h3>Tailored Mock Interview Prep</h3>
                    <p className="pane-intro">Advanced AI has parsed your actual work experiences and projects to formulate behavioral and technical questions likely to be asked by engineering managers.</p>
                    
                    <div className="questions-list">
                      {report.interview_questions?.map((q, idx) => (
                        <div key={idx} className="question-card">
                          <div className="question-card-header">
                            <span className="question-idx-badge">Question {idx + 1}</span>
                            <span className="question-section-badge">📌 {q.section}</span>
                          </div>
                          <h4>{q.question}</h4>
                          <div className="question-card-body">
                            <div className="eval-sub-section">
                              <strong>Intent / What is evaluated:</strong>
                              <p>{q.intent}</p>
                            </div>
                            <div className="eval-sub-section">
                              <strong>Suggested Approach:</strong>
                              <p className="approach-text">{q.suggested_approach}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!report.interview_questions || report.interview_questions.length === 0) && (
                        <p className="no-rewrites">No mock questions could be generated from the CV content.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. BULLET WRITER TAB */}
                {activeReportTab === "rewriter" && (
                  <div className="tab-pane rewriter-pane">
                    <h3>Resume Bullet Point Metric Optimizer</h3>
                    <p className="pane-intro">Descriptive bullet points detail what you were responsible for, but metrics-driven bullet points prove the value and impact of your work. Here is how you can rewrite weak statements:</p>
                    
                    <div className="rewrites-container">
                      {report.rewrite_suggestions?.map((item, idx) => (
                        <div key={idx} className="rewrite-block">
                          <div className="rewrite-row">
                            <div className="rewrite-side original-side">
                              <div className="side-badge badge-orig">Original Bullet Point</div>
                              <p>"{item.original}"</p>
                            </div>
                            <div className="rewrite-divider">➔</div>
                            <div className="rewrite-side suggested-side">
                              <div className="side-badge badge-sugg">Metrics-Driven Alternative</div>
                              <p>"{item.suggested}"</p>
                            </div>
                          </div>
                          <div className="rewrite-rationale">
                            <strong>AI Rationale:</strong> {item.rationale}
                          </div>
                        </div>
                      ))}
                      {(!report.rewrite_suggestions || report.rewrite_suggestions.length === 0) && (
                        <p className="no-rewrites">No bullet point rewrites generated. Make sure your resume has work experience descriptors.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. COVER LETTER TAB */}
                {activeReportTab === "cover_letter" && (
                  <div className="tab-pane cover-letter-pane">
                    <h3>AI Cover Letter & Outreach Generator</h3>
                    <p className="pane-intro">Generate a cover letter and LinkedIn cold email tailored directly to your resume and the target job description.</p>
                    
                    {!coverLetterReport && !generatingCoverLetter && (
                      <div className="generate-cover-letter-box" style={{ maxWidth: "600px", width: "100%" }}>
                        <h4 style={{ color: "#fff", margin: "0 0 10px 0", textAlign: "left", fontSize: "1rem", width: "100%" }}>Target Position Details</h4>
                        
                        <div className="input-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", width: "100%", marginBottom: "15px" }}>
                          <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Designation / Job Title</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Frontend Developer" 
                              value={jdTitle}
                              onChange={(e) => setJdTitle(e.target.value)}
                              className="form-input"
                              style={{ padding: "8px", fontSize: "0.85rem", background: "#ffffff", border: "1px solid var(--border-glass)", color: "var(--text-main)", borderRadius: "6px" }}
                            />
                          </div>
                          <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Company Name</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Google" 
                              value={jdCompany}
                              onChange={(e) => setJdCompany(e.target.value)}
                              className="form-input"
                              style={{ padding: "8px", fontSize: "0.85rem", background: "#ffffff", border: "1px solid var(--border-glass)", color: "var(--text-main)", borderRadius: "6px" }}
                            />
                          </div>
                        </div>

                        {/* Inline subform if no JD was provided on main screen */}
                        {!jdText?.trim() && (
                          <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left", width: "100%", marginBottom: "15px" }}>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Job Description (Required)</label>
                            <textarea 
                              placeholder="Paste the target job description here to customize your cover letter..." 
                              value={jdText}
                              onChange={(e) => setJdText(e.target.value)}
                              rows={6}
                              className="form-textarea"
                              style={{ padding: "8px", fontSize: "0.85rem", background: "#ffffff", border: "1px solid var(--border-glass)", color: "var(--text-main)", borderRadius: "6px", width: "100%", boxSizing: "border-box" }}
                            ></textarea>
                          </div>
                        )}

                        <div className="tone-selector-group">
                          <label htmlFor="tone-select">Choose Writing Tone:</label>
                          <select 
                            id="tone-select"
                            value={coverLetterTone}
                            onChange={(e) => setCoverLetterTone(e.target.value)}
                            className="tone-select"
                          >
                            <option value="professional">💼 Professional / Formal</option>
                            <option value="enthusiastic">🔥 Enthusiastic / Passionate</option>
                            <option value="creative">🎨 Creative / Unconventional</option>
                          </select>
                        </div>
                        
                        <button 
                          className="primary-btn-action generate-btn" 
                          onClick={handleGenerateCoverLetter}
                          disabled={!jdText?.trim()}
                          style={{ opacity: !jdText?.trim() ? 0.6 : 1, cursor: !jdText?.trim() ? "not-allowed" : "pointer" }}
                        >
                          ✨ Generate Cover Letter & Cold Email
                        </button>

                        {!jdText?.trim() && (
                          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0" }}>
                            * Please enter a Job Description above to enable generation.
                          </p>
                        )}
                        
                        {coverLetterError && (
                          <p className="error-text" style={{ marginTop: "15px", color: "#ef4444" }}>
                            {coverLetterError}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {generatingCoverLetter && (
                      <div className="loading-card inline-loading">
                        <div className="double-bounce-spinner">
                          <div className="double-bounce1"></div>
                          <div className="double-bounce2"></div>
                        </div>
                        <h4>Drafting custom cover letter & LinkedIn outreach...</h4>
                      </div>
                    )}
                    
                    {coverLetterReport && !generatingCoverLetter && (
                      <div className="cover-letter-results">
                        <div className="results-actions" style={{ display: "flex", flexDirection: "column", gap: "12px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "15px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 150px 80px", gap: "16px", alignItems: "flex-end", width: "100%" }}>
                            <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
                              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Designation / Job Title</label>
                              <input 
                                type="text" 
                                value={jdTitle}
                                onChange={(e) => setJdTitle(e.target.value)}
                                className="form-input"
                                style={{ padding: "6px 10px", fontSize: "0.8rem", background: "#ffffff", border: "1px solid var(--border-glass)", color: "var(--text-main)", borderRadius: "6px" }}
                              />
                            </div>
                            <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
                              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Company Name</label>
                              <input 
                                type="text" 
                                value={jdCompany}
                                onChange={(e) => setJdCompany(e.target.value)}
                                className="form-input"
                                style={{ padding: "6px 10px", fontSize: "0.8rem", background: "#ffffff", border: "1px solid var(--border-glass)", color: "var(--text-main)", borderRadius: "6px" }}
                              />
                            </div>
                            <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
                              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Writing Tone</label>
                              <select 
                                value={coverLetterTone}
                                onChange={(e) => setCoverLetterTone(e.target.value)}
                                className="tone-select"
                                style={{ padding: "6px 10px", fontSize: "0.8rem", width: "100%" }}
                              >
                                <option value="professional">💼 Professional / Formal</option>
                                <option value="enthusiastic">🔥 Enthusiastic / Passionate</option>
                                <option value="creative">🎨 Creative / Unconventional</option>
                              </select>
                            </div>
                            <button 
                              className="regenerate-btn" 
                              onClick={handleGenerateCoverLetter}
                              style={{ padding: "8px 12px", fontSize: "0.8rem", height: "32px", background: "var(--primary-gradient)", border: "none", color: "#fff", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
                            >
                              🔄 Go
                            </button>
                          </div>
                        </div>
                        
                        <div className="documents-split-grid">
                          <div className="result-doc-column">
                            <div className="doc-column-header">
                              <h4>Custom Cover Letter</h4>
                              <button 
                                className="copy-btn" 
                                onClick={() => {
                                  navigator.clipboard.writeText(coverLetterReport.cover_letter);
                                  alert("Cover Letter copied to clipboard!");
                                }}
                              >
                                📋 Copy Letter
                              </button>
                            </div>
                            <div className="doc-content-display">
                              <pre className="markdown-content">{coverLetterReport.cover_letter}</pre>
                            </div>
                          </div>
                          
                          <div className="result-doc-column">
                            <div className="doc-column-header">
                              <h4>Cold Email & LinkedIn Outreach</h4>
                              <button 
                                className="copy-btn" 
                                onClick={() => {
                                  navigator.clipboard.writeText(coverLetterReport.cold_email);
                                  alert("Outreach message copied to clipboard!");
                                }}
                              >
                                📋 Copy Outreach
                              </button>
                            </div>
                            <div className="doc-content-display">
                              <pre className="markdown-content">{coverLetterReport.cold_email}</pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* 7. SKILLS ROADMAP TAB */}
                {activeReportTab === "roadmap" && (
                  <div className="tab-pane roadmap-pane">
                    <h3>🛣️ Technology & Skills Development Roadmap</h3>
                    <p className="pane-intro">Use this interactive checklist to target and check off missing skills. As you complete items, your projected match score will dynamically climb.</p>
                    
                    <div className="roadmap-score-progress-card" style={{ background: "rgba(0, 0, 0, 0.03)", padding: "20px", borderRadius: "10px", border: "1px solid var(--border-glass)", marginBottom: "20px" }}>
                      <div className="roadmap-score-bar-wrapper">
                        <div className="roadmap-score-label" style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.95rem" }}>
                          <span>Base Match Score: <strong>{report.match_score.toFixed(0)}%</strong></span>
                          <span>Projected Score: <strong style={{ color: "#10b981", padding: "2px 8px", background: "rgba(16, 185, 129, 0.15)", borderRadius: "4px" }}>{calculateProjectedScore()}%</strong></span>
                        </div>
                        <div className="roadmap-progress-track" style={{ height: "12px", background: "#cbd5e1", borderRadius: "6px", overflow: "hidden", position: "relative" }}>
                          <div className="roadmap-progress-fill base-fill" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${report.match_score}%`, background: "#4f46e5", transition: "width 0.4s ease" }}></div>
                          <div className="roadmap-progress-fill projected-fill" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${calculateProjectedScore()}%`, background: "#10b981", transition: "width 0.4s ease", opacity: 0.7 }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="roadmap-items-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {roadmapItems.map((item) => (
                        <div key={item.id} className={`roadmap-item-card ${item.status}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "rgba(0, 0, 0, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "8px", transition: "all 0.2s ease" }}>
                          <div className="roadmap-item-checkbox-wrapper" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <input
                              type="checkbox"
                              id={`roadmap-chk-${item.id}`}
                              checked={item.status === "completed"}
                              onChange={() => handleToggleRoadmapItem(item.id, item.status)}
                              style={{ width: "16px", height: "16px", cursor: "pointer" }}
                            />
                            <label htmlFor={`roadmap-chk-${item.id}`} style={{ fontSize: "0.95rem", cursor: "pointer", textDecoration: item.status === "completed" ? "line-through" : "none", color: item.status === "completed" ? "var(--text-secondary)" : "var(--text-main)" }}>
                              {item.skill_name}
                            </label>
                          </div>
                          <div className="roadmap-item-actions" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                            <span className={`roadmap-status-badge badge-${item.status}`} style={{ fontSize: "0.75rem", padding: "4px 8px", borderRadius: "4px", background: item.status === "completed" ? "rgba(16, 185, 129, 0.15)" : item.status === "in_progress" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)", color: item.status === "completed" ? "#10b981" : item.status === "in_progress" ? "#f59e0b" : "#ef4444" }}>
                              {item.status === "completed" ? "✅ Completed" : item.status === "in_progress" ? "⏳ In Progress" : "⚠️ Missing"}
                            </span>
                            <a
                              href={item.learning_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: "0.85rem", color: "var(--primary-light)", textDecoration: "none", fontWeight: "500" }}
                              title="Search learning content"
                            >
                              📺 Learn on YouTube ➔
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Version Clone/Tailoring Modal */}
      {showVersionModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px", width: "90%", background: "#1f2937", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "24px" }}>
            <h2 style={{ marginTop: 0, marginBottom: "8px" }}>➕ Clone & Tailor Resume Version</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>Create a dedicated text-based version of your CV. If you leave the tailored text blank, it will copy the original file's text for editing.</p>
            <div className="input-group" style={{ marginBottom: "15px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", display: "block", marginBottom: "6px" }}>Version Name</label>
              <input
                type="text"
                placeholder="e.g. Web Developer Specialization"
                value={newVersionName}
                onChange={(e) => setNewVersionName(e.target.value)}
                className="form-input"
                style={{ width: "100%" }}
              />
            </div>
            <div className="input-group" style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", display: "block", marginBottom: "6px" }}>Initial Tailored Text (Optional)</label>
              <textarea
                placeholder="Paste tailored resume text here, or leave blank to start with original CV text..."
                value={newVersionText}
                onChange={(e) => setNewVersionText(e.target.value)}
                rows={8}
                className="form-textarea"
                style={{ width: "100%" }}
              ></textarea>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="secondary-btn" style={{ padding: "8px 16px", borderRadius: "6px", background: "transparent", border: "1px solid var(--border-glass)", color: "#fff", cursor: "pointer" }} onClick={() => setShowVersionModal(false)}>Cancel</button>
              <button className="primary-btn" style={{ padding: "8px 16px", borderRadius: "6px", background: "var(--primary-gradient)", border: "none", color: "#fff", cursor: "pointer", fontWeight: "600" }} onClick={handleCreateVersion}>Create Version</button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Panel Overlay */}
      {showEditorPanel && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "800px", width: "90%", background: "#ffffff", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "24px" }}>
            <h2 style={{ marginTop: 0, marginBottom: "8px" }}>✏️ Edit Resume Version Text</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>Make direct content or keyword updates to this tailored resume. Click save when finished.</p>
            <div className="input-group" style={{ marginBottom: "20px" }}>
              <textarea
                value={editingVersionText}
                onChange={(e) => setEditingVersionText(e.target.value)}
                rows={16}
                className="form-textarea"
                style={{ width: "100%", fontFamily: "monospace", fontSize: "0.85rem", lineHeight: "1.4", background: "#f8fafc", border: "1px solid var(--border-glass)", color: "var(--text-main)", borderRadius: "6px", padding: "12px" }}
              ></textarea>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="secondary-btn" style={{ padding: "8px 16px", borderRadius: "6px", background: "transparent", border: "1px solid var(--border-glass)", color: "var(--text-main)", cursor: "pointer" }} onClick={() => {
                setShowEditorPanel(false);
                setEditingVersionId(null);
              }}>Cancel</button>
              <button className="primary-btn" style={{ padding: "8px 16px", borderRadius: "6px", background: "var(--primary-gradient)", border: "none", color: "#fff", cursor: "pointer", fontWeight: "600" }} onClick={handleUpdateVersion}>Save Updates</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
