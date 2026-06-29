import { useState, useEffect } from "react";
import api from "./api/client";
import Upload from "./components/Upload";
import Auth from "./components/Auth";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("docusense_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [documents, setDocuments] = useState([]);
  const [selectedFilename, setSelectedFilename] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [invalidFile, setInvalidFile] = useState(null);

  // Monitor for document validation failure to prompt user
  useEffect(() => {
    const failedDoc = documents.find((d) => d.status === "failed");
    if (failedDoc && (!invalidFile || invalidFile.filename !== failedDoc.filename)) {
      setInvalidFile({ filename: failedDoc.filename });
    }
  }, [documents, invalidFile]);

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
    setUser(null);
    setDocuments([]);
    setSelectedFilename(null);
  };

  // If user is not authenticated, show login/signup portal
  if (!user) {
    return <Auth onAuthSuccess={setUser} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">D</div>
          <div className="logo-details">
            <div className="logo-main-text">
              <span className="logo-text-docusense">DocuSense</span>
              <span className="logo-text-ai">AI</span>
            </div>
            <div className="logo-subtitle">INTELLIGENT DOCUMENT ANALYSIS</div>
          </div>
        </div>

        {/* User Profile Info */}
        <div className="user-profile-widget">
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
          </div>
        </div>

        {/* Documents list */}
        <div className="doc-section">
          <div className="section-title">Indexed Documents</div>
          <div className="doc-list">
            {documents.length === 0 ? (
              <div className="no-docs">No documents uploaded yet</div>
            ) : (
              documents.map((doc, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (doc.status !== "failed") {
                      setSelectedFilename(doc.filename);
                    }
                  }}
                  className={`doc-item ${selectedFilename === doc.filename ? "active" : ""} ${doc.status === "indexing" ? "doc-indexing" : ""} ${doc.status === "failed" ? "doc-failed" : ""}`}
                  title={doc.filename}
                  disabled={doc.status === "indexing" || doc.status === "failed"} // Optionally disable selecting indexing/failed documents to maintain UX sanity
                >
                  <span className={`doc-item-icon ${doc.status === "indexing" ? "spin-icon" : ""}`}>
                    {doc.status === "indexing" ? "⏳" : doc.status === "failed" ? "⚠️" : "📄"}
                  </span>
                  <span className="doc-item-name">
                    {doc.filename} {doc.status === "indexing" ? "(indexing...)" : doc.status === "failed" ? "(Invalid Resume/CV)" : ""}
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

        {/* Upload Widget & Logout at Bottom */}
        <div className="sidebar-bottom-controls">
          <div className="upload-sidebar-widget">
            <Upload onUploadDone={handleUploadDone} />
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="main-workspace">
        <header className="workspace-header">
          <div className="active-doc-info">
            <span className="active-doc-label">Current View:</span>
            <span className="active-doc-title">
              Resume AI Suite
            </span>
          </div>
        </header>

        <ResumeAnalyzer
          documents={documents}
          selectedFilename={selectedFilename}
          setSelectedFilename={setSelectedFilename}
        />
      </main>

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
                // Automatically delete document
                await handleDelete(fname);
                // Trigger file browse input dialog
                const fileInput = document.querySelector("input[type='file']");
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
    </div>
  );
}
