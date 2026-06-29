import { useState, useEffect } from "react";
import api from "../api/client";
import "./ResumeAnalyzer.css";

export default function ResumeAnalyzer({ documents: allDocs = [], selectedFilename, setSelectedFilename }) {
  const [jdText, setJdText] = useState("");
  const [jdTitle, setJdTitle] = useState("");
  const [jdCompany, setJdCompany] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [activeReportTab, setActiveReportTab] = useState("jd_match"); // "jd_match", "gaps", "ats", "interview", "rewriter", "cover_letter"
  const [viewMode, setViewMode] = useState("create"); // "create" or "history"

  const [coverLetterReport, setCoverLetterReport] = useState(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [coverLetterTone, setCoverLetterTone] = useState("professional");
  const [coverLetterError, setCoverLetterError] = useState("");

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
  }, [selectedFilename]);

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
        jd_company: jdCompany
      });
      
      setReport(res.data);
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
                
                <div className="input-group">
                  <label htmlFor="resume-select">Select Uploaded Resume</label>
                  {documents.length === 0 ? (
                    <div className="no-resumes-warning">
                      ⚠️ No PDF or Word document uploaded. Please upload a resume using the sidebar upload tool first.
                    </div>
                  ) : (
                    <select 
                      id="resume-select"
                      value={selectedFilename} 
                      onChange={(e) => setSelectedFilename(e.target.value)}
                      className="form-select"
                    >
                      {documents.map((doc, idx) => (
                        <option key={idx} value={doc.filename}>{doc.filename}</option>
                      ))}
                    </select>
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
                              style={{ padding: "8px", fontSize: "0.85rem", background: "#111827", border: "1px solid var(--border-glass)", color: "#fff", borderRadius: "6px" }}
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
                              style={{ padding: "8px", fontSize: "0.85rem", background: "#111827", border: "1px solid var(--border-glass)", color: "#fff", borderRadius: "6px" }}
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
                              style={{ padding: "8px", fontSize: "0.85rem", background: "#111827", border: "1px solid var(--border-glass)", color: "#fff", borderRadius: "6px", width: "100%", boxSizing: "border-box" }}
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
                                style={{ padding: "6px 10px", fontSize: "0.8rem", background: "#111827", border: "1px solid var(--border-glass)", color: "#fff", borderRadius: "6px" }}
                              />
                            </div>
                            <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
                              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Company Name</label>
                              <input 
                                type="text" 
                                value={jdCompany}
                                onChange={(e) => setJdCompany(e.target.value)}
                                className="form-input"
                                style={{ padding: "6px 10px", fontSize: "0.8rem", background: "#111827", border: "1px solid var(--border-glass)", color: "#fff", borderRadius: "6px" }}
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
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
