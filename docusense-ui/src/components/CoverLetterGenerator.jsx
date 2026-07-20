import React, { useState } from "react";
import "./CoverLetterGenerator.css";
import { streamAgentWorkflow } from "../api/agentStream";

export default function CoverLetterGenerator() {
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [tone, setTone] = useState("Professional");
  
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!resumeText.trim()) {
      alert("Please paste your resume text or upload a document first.");
      return;
    }

    setLoading(true);
    setAgentStatus("🤖 Cover Letter Agent Initializing...");
    setCoverLetter("");

    const customJd = `Company: ${targetCompany || "Target Employer"}\nTone: ${tone}\n\nJob Description:\n${jdText}`;

    await streamAgentWorkflow({
      userGoal: "COVER_LETTER",
      resumeText,
      jdText: customJd,
      onEvent: (data) => {
        setAgentStatus(`🤖 ${data.agent}: ${data.message}`);
        if (data.event === "A2UI_COVER_LETTER_STREAM" && data.payload?.cover_letter) {
          setCoverLetter(data.payload.cover_letter);
        }
      },
      onComplete: (payload) => {
        if (payload?.cover_letter) setCoverLetter(payload.cover_letter);
        setLoading(false);
        setAgentStatus("✅ Cover Letter Complete!");
      },
      onError: (err) => {
        alert("Generation Error: " + err.message);
        setLoading(false);
        setAgentStatus("❌ Failed to generate.");
      }
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cover-letter-workshop">
      <div className="workshop-header">
        <h1>✉️ AI Cover Letter Generator Workshop</h1>
        <p>Craft highly tailored, persuasive cover letters powered by specialized Multi-Agents & LlamaIndex document parsing.</p>
      </div>

      <div className="workshop-grid">
        {/* Left Panel: Inputs */}
        <div className="input-card">
          <h3>1. Inputs & Preferences</h3>
          
          <div className="form-group">
            <label>Target Company / Organization</label>
            <input 
              type="text" 
              placeholder="e.g. Google, Microsoft, Tech Corp"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Cover Letter Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="Professional">Professional & Polished</option>
              <option value="Enthusiastic">Enthusiastic & High Energy</option>
              <option value="Executive">Executive & Strategic</option>
              <option value="Creative">Creative & Storytelling</option>
            </select>
          </div>

          <div className="form-group">
            <label>Resume / CV Content *</label>
            <textarea
              rows={6}
              placeholder="Paste your resume content or achievements here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Job Description (Optional for alignment)</label>
            <textarea
              rows={5}
              placeholder="Paste the job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>

          <button 
            className="btn-generate" 
            onClick={handleGenerate} 
            disabled={loading}
          >
            {loading ? "⚡ Generating via Multi-Agents..." : "🚀 Generate Tailored Cover Letter"}
          </button>

          {agentStatus && <div className="agent-status-badge">{agentStatus}</div>}
        </div>

        {/* Right Panel: Output & Live Preview */}
        <div className="preview-card">
          <div className="preview-header">
            <h3>2. Tailored Cover Letter Preview</h3>
            {coverLetter && (
              <button className="btn-copy" onClick={handleCopy}>
                {copied ? "✓ Copied!" : "📋 Copy Text"}
              </button>
            )}
          </div>

          <div className="letter-output-box">
            {coverLetter ? (
              <textarea 
                className="editable-letter" 
                value={coverLetter} 
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            ) : (
              <div className="placeholder-text">
                <div className="sparkle-icon">✨</div>
                <p>Your AI-generated cover letter will stream live here once you click generate.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
