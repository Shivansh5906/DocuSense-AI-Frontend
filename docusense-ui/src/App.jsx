import { useState, useEffect } from "react";
import api from "./api/client";
import Upload from "./components/Upload";
import Auth from "./components/Auth";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import LandingDashboard from "./components/LandingDashboard";
import ResumeBuilder from "./components/ResumeBuilder";
import LinkedInOptimizer from "./components/LinkedInOptimizer";
import CoverLetterGenerator from "./components/CoverLetterGenerator";
import InterviewPrep from "./components/InterviewPrep";
import CareerBlog from "./components/CareerBlog";
import "./App.css";

export default function App() {
  const [user, setUser] = useState({
    id: 1,
    name: "Guest User",
    email: "guest@docusense.ai"
  });
  const [documents, setDocuments] = useState([]);
  const [selectedFilename, setSelectedFilename] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [invalidFile, setInvalidFile] = useState(null);
  const [activeView, setActiveView] = useState("landing"); // "landing", "builder", "matcher", "cover_letter", "review", "linkedin", "templates", "examples", "pricing", "blog"
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const showSidebarLayout = !["landing", "pricing", "blog", "templates", "examples", "builder_select_template", "builder"].includes(activeView);

  const navigateTo = (view) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
    setIsMobileSidebarOpen(false);
  };

  // Monitor for document validation failure to prompt user
  useEffect(() => {
    const failedDoc = documents.find((d) => d.status === "failed");
    if (failedDoc && (!invalidFile || invalidFile.filename !== failedDoc.filename)) {
      setInvalidFile({ filename: failedDoc.filename });
    }
  }, [documents, invalidFile]);

  // Warm up sleeping Render backend on page load
  useEffect(() => {
    api.get("/health").catch(() => {});
  }, []);

  // Fetch unique documents list on load or when refreshKey/user changes, with 3s polling for status updates
  useEffect(() => {
    if (!user) return;

    const fetchDocs = async () => {
      try {
        const res = await api.get("/documents");
        if (res.data && res.data.documents) {
          setDocuments(res.data.documents);

          // Auto-select the first document if none is selected yet
          if (res.data.documents.length > 0 && selectedFilename === null) {
            setSelectedFilename(res.data.documents[0].filename);
          }
        }
      } catch (err) {
        console.error("Failed to load documents list", err);
      }
    };

    fetchDocs();
    const interval = setInterval(fetchDocs, 3000);
    return () => clearInterval(interval);
  }, [refreshKey, user, selectedFilename]);

  const handleUploadDone = (fname) => {
    setRefreshKey((prev) => prev + 1);
    setSelectedFilename(fname);
  };

  const handleGlobalUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      try {
        await api.post("/documents/upload", formData);
        handleUploadDone(file.name);
      } catch (err) {
        console.error("Global upload failed", err);
        alert("Upload failed. Please make sure the file is a valid PDF or DOCX.");
      }
    }
  };

  const handleDelete = async (filename) => {
    try {
      await api.delete(`/documents/${encodeURIComponent(filename)}`);
      if (selectedFilename === filename) {
        setSelectedFilename(null);
      }
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to delete document", err);
      alert("Failed to delete document. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("docusense_token");
    localStorage.removeItem("docusense_user");
    setSelectedFilename(null);
    setActiveView("landing");
  };

  return (
    <div className="app-main-layout">
      {/* 1. Header Navigation Bar ( responsive mobile drawer ready ) */}
      <header className="app-top-navbar">
        <div className="navbar-logo" onClick={() => navigateTo("landing")}>
          <div className="logo-icon-small">D</div>
          <div className="logo-text-group">
            <span className="logo-bold">Docu</span>
            <span className="logo-light">Sense</span>
          </div>
        </div>

        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>

        <div 
          className={`mobile-nav-backdrop ${isMobileMenuOpen ? "open" : ""}`} 
          onClick={() => setIsMobileMenuOpen(false)} 
        />

        <nav className={`navbar-nav-links ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          <button className={`nav-link-btn ${activeView === "landing" ? "active" : ""}`} onClick={() => navigateTo("landing")}>Home</button>
          <button className={`nav-link-btn ${["builder", "builder_select_template"].includes(activeView) ? "active" : ""}`} onClick={() => navigateTo("builder_select_template")}>Resume Builder</button>
          <button className={`nav-link-btn ${activeView === "review" ? "active" : ""}`} onClick={() => navigateTo("review")}>ATS & Matcher</button>
          <button className={`nav-link-btn ${activeView === "cover_letter" ? "active" : ""}`} onClick={() => navigateTo("cover_letter")}>Cover Letter AI</button>
          <button className={`nav-link-btn ${activeView === "linkedin" ? "active" : ""}`} onClick={() => navigateTo("linkedin")}>LinkedIn AI</button>
          <button className={`nav-link-btn ${activeView === "interview_prep" ? "active" : ""}`} onClick={() => navigateTo("interview_prep")}>Interview & Tools</button>
        </nav>

        <div className="navbar-right-controls">
          <div className="user-profile-badge-nav">
            <div className="avatar-circle-nav">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="user-nav-name">{user.name}</span>
            <div className="profile-dropdown-nav">
              <button className="signout-item-btn" onClick={handleLogout}>🚪 Sign Out</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <div className="app-container">
        {/* Collapsible Documents Sidebar */}
        <aside className={`sidebar ${showSidebarLayout ? "" : "collapsed"} ${isMobileSidebarOpen ? "mobile-drawer-open" : ""}`}>
          <div className="doc-section">
            <div className="section-title">
              Uploaded Base CVs
              <button className="mobile-sidebar-close" onClick={() => setIsMobileSidebarOpen(false)}>✕</button>
            </div>
            <div className="doc-list">
              {documents.length === 0 ? (
                <div className="no-docs">No CVs uploaded yet</div>
              ) : (
                documents.map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (doc.status !== "failed") {
                        setSelectedFilename(doc.filename);
                        setIsMobileSidebarOpen(false);
                      }
                    }}
                    className={`doc-item ${selectedFilename === doc.filename ? "active" : ""} ${doc.status === "indexing" ? "doc-indexing" : ""} ${doc.status === "failed" ? "doc-failed" : ""}`}
                    title={doc.filename}
                    disabled={doc.status === "indexing" || doc.status === "failed"}
                  >
                    <span className={`doc-item-icon ${doc.status === "indexing" ? "spin-icon" : ""}`}>
                      {doc.status === "indexing" ? "⏳" : doc.status === "failed" ? "⚠️" : "📄"}
                    </span>
                    <span className="doc-item-name">
                      {doc.filename}
                    </span>
                    {doc.status !== "indexing" && (
                      <span
                        className="delete-doc-icon"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete "${doc.filename}"?`)) {
                            await handleDelete(doc.filename);
                          }
                        }}
                        title="Delete document"
                      >
                        🗑️
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        {isMobileSidebarOpen && (
          <div className="mobile-sidebar-backdrop" onClick={() => setIsMobileSidebarOpen(false)} />
        )}

        {/* Main Workspace Area */}
        <main className="main-workspace">
          <header className="workspace-header">
            {showSidebarLayout && (
              <button 
                className="mobile-sidebar-toggle-btn"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              >
                📁 {selectedFilename ? selectedFilename : "Base CVs"}
              </button>
            )}
            <div className="active-doc-info">
              <span className="active-doc-label">Workspace:</span>
              <span className="active-doc-title">
                {activeView === "landing" && "Career Services Dashboard"}
                {activeView === "builder_select_template" && "Select Resume Template"}
                {activeView === "builder" && "Interactive Resume Creator"}
                {activeView === "matcher" && "Resume Job Matcher"}
                {activeView === "cover_letter" && "AI Cover Letter Workshop"}
                {activeView === "interview_prep" && "Interview Prep & Keyword Finder"}
                {activeView === "review" && "Resume & CV ATS Audit"}
                {activeView === "linkedin" && "LinkedIn Profile Optimizer"}
                {activeView === "blog" && "Career Guides Library"}
                {activeView === "templates" && "Layout Style Templates"}
                {activeView === "examples" && "Specialized Resume Examples"}
                {activeView === "pricing" && "Affordable Plan Selector"}
              </span>
            </div>
          </header>

          <div className="workspace-view-content">
            {activeView === "landing" && (
              <LandingDashboard onViewChange={setActiveView} />
            )}

            {activeView === "builder" && (
              <ResumeBuilder
                selectedFilename={selectedFilename}
                onSaveSuccess={() => setRefreshKey((prev) => prev + 1)}
                initialTemplate={selectedTemplate}
              />
            )}

            {activeView === "matcher" && (
              <ResumeAnalyzer
                documents={documents}
                selectedFilename={selectedFilename}
                setSelectedFilename={setSelectedFilename}
                onUploadDone={handleUploadDone}
                onNavigate={setActiveView}
                forceTab="jd_match"
              />
            )}

            {activeView === "cover_letter" && (
              <CoverLetterGenerator />
            )}

            {activeView === "interview_prep" && (
              <InterviewPrep />
            )}

            {activeView === "review" && (
              <ResumeAnalyzer
                documents={documents}
                selectedFilename={selectedFilename}
                setSelectedFilename={setSelectedFilename}
                onUploadDone={handleUploadDone}
                forceTab="ats"
              />
            )}

            {activeView === "linkedin" && (
              <LinkedInOptimizer
                documents={documents}
                selectedFilename={selectedFilename}
              />
            )}

            {activeView === "blog" && (
              <CareerBlog />
            )}

            {activeView === "pricing" && (
              <div className="standalone-pricing-pane animate-fade-in" style={{ padding: "10px 0" }}>
                <LandingDashboard onViewChange={setActiveView} />
              </div>
            )}

            {activeView === "builder_select_template" && (
              <div className="templates-selector-pane animate-fade-in" style={{ padding: "10px 0" }}>
                <div className="optimizer-header" style={{ marginBottom: "24px" }}>
                  <h2 style={{ color: "var(--text-main)" }}>🎨 Select Resume Template</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Select a layout structure to get started building your resume.</p>
                </div>
                <div className="templates-showcase-grid">
                  <div className="template-card card" style={{ padding: "24px", cursor: "pointer", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", transition: "var(--transition-smooth)" }} onClick={() => { setSelectedTemplate("modern"); setActiveView("builder"); }}>
                    <div style={{ background: "#111827", height: "180px", borderRadius: "8px", marginBottom: "15px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)", fontSize: "3rem" }}>
                      📄
                    </div>
                    <h4 style={{ color: "var(--text-main)", marginBottom: "8px" }}>Modern Style</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>Clean sans-serif fonts, vertical block alignment, left accent highlights. Best for software, product, and data roles.</p>
                  </div>
                  <div className="template-card card" style={{ padding: "24px", cursor: "pointer", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", transition: "var(--transition-smooth)" }} onClick={() => { setSelectedTemplate("professional"); setActiveView("builder"); }}>
                    <div style={{ background: "#111827", height: "180px", borderRadius: "8px", marginBottom: "15px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)", fontSize: "3rem" }}>
                      📜
                    </div>
                    <h4 style={{ color: "var(--text-main)", marginBottom: "8px" }}>Professional Style</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>Centered formal headers, standard Georgia/serif typography, clean horizontal rules. Recommended for executive and finance roles.</p>
                  </div>
                  <div className="template-card card" style={{ padding: "24px", cursor: "pointer", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", transition: "var(--transition-smooth)" }} onClick={() => { setSelectedTemplate("creative"); setActiveView("builder"); }}>
                    <div style={{ background: "#111827", height: "180px", borderRadius: "8px", marginBottom: "15px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)", fontSize: "3rem" }}>
                      🎨
                    </div>
                    <h4 style={{ color: "var(--text-main)", marginBottom: "8px" }}>Creative Style</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>Split-column layouts with a solid colored sidebar (left) and white details (right). Stand out in media, design, and marketing fields.</p>
                  </div>
                </div>
              </div>
            )}

            {activeView === "examples" && (
              <div className="examples-selector-pane animate-fade-in" style={{ padding: "10px 0" }}>
                <div className="optimizer-header" style={{ marginBottom: "24px" }}>
                  <h2>📂 Pre-filled Resume Examples</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Load a specialized mock profile into your editor workspace to see layout formats.</p>
                </div>
                <div className="examples-showcase-grid">
                  <div className="card" style={{ padding: "24px", background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: "12px" }}>
                    <h3 style={{ color: "#fff", marginBottom: "10px" }}>Senior Software Engineer</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: "1.5" }}>Features advanced React, TypeScript stack details, bundle reductions, and team management accomplishments.</p>
                    <button className="cta-primary-btn" onClick={() => setActiveView("builder")}>Load & Edit Example ➔</button>
                  </div>
                  <div className="card" style={{ padding: "24px", background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: "12px" }}>
                    <h3 style={{ color: "#fff", marginBottom: "10px" }}>Senior Product Manager</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: "1.5" }}>Focuses on SaaS checkout conversion lifts, merchant payment APIs, user analytics, and agile methodology.</p>
                    <button className="cta-primary-btn" onClick={() => setActiveView("builder")}>Load & Edit Example ➔</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {invalidFile && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">⚠️</span>
            <h2>Invalid Document</h2>
            <p>
              The document <strong>{invalidFile.filename}</strong> does not appear to be a valid Resume or CV. Please upload a correct Resume/CV file.
            </p>
            <button
              className="primary-btn"
              style={{ marginTop: "10px" }}
              onClick={async () => {
                const fname = invalidFile.filename;
                setInvalidFile(null);
                await handleDelete(fname);
                const fileInput = document.getElementById("app-global-file-input");
                if (fileInput) {
                  fileInput.click();
                }
              }}
            >
              Upload Again
            </button>
          </div>
        </div>
      )}
      <input
        type="file"
        id="app-global-file-input"
        accept=".pdf,.docx"
        style={{ display: "none" }}
        onChange={handleGlobalUpload}
      />
    </div>
  );
}

