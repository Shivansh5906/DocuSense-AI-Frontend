import React, { useState } from "react";
import "./InterviewPrep.css";
import { streamAgentWorkflow } from "../api/agentStream";

export default function InterviewPrep() {
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  
  const [questions, setQuestions] = useState([]);
  const [keywords, setKeywords] = useState({ matching: [], missing: [] });
  const [loading, setLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState("");

  const handleGeneratePrep = async () => {
    if (!resumeText.trim()) {
      alert("Please paste your resume content or upload a document first.");
      return;
    }

    setLoading(true);
    setAgentStatus("🤖 Interview Coach & Keyword Finder Agent Working...");
    setQuestions([]);

    await streamAgentWorkflow({
      userGoal: "INTERVIEW_PREP",
      resumeText,
      jdText,
      onEvent: (data) => {
        setAgentStatus(`🤖 ${data.agent}: ${data.message}`);
        if (data.event === "A2UI_INTERVIEW_UPDATE" && Array.isArray(data.payload)) {
          setQuestions(data.payload);
        }
        if (data.event === "A2UI_ATS_UPDATE" && data.payload) {
          setKeywords({
            matching: data.payload.matching_skills || [],
            missing: data.payload.missing_skills || []
          });
        }
      },
      onComplete: (payload) => {
        if (payload?.interview_questions) setQuestions(payload.interview_questions);
        if (payload?.ats_result) {
          setKeywords({
            matching: payload.ats_result.matching_skills || [],
            missing: payload.ats_result.missing_skills || []
          });
        }
        setLoading(false);
        setAgentStatus("✅ Interview Prep & Keyword Analysis Ready!");
      },
      onError: (err) => {
        alert("Preparation Error: " + err.message);
        setLoading(false);
        setAgentStatus("❌ Execution error.");
      }
    });
  };

  return (
    <div className="interview-prep-workshop">
      <div className="workshop-header">
        <h1>🎯 Interview Prep & Keyword Finder Workshop</h1>
        <p>Get tailored STAR-method interview questions and analyze job description keyword alignment powered by Multi-Agents & LlamaIndex.</p>
      </div>

      <div className="workshop-grid">
        {/* Left Card: Input */}
        <div className="input-card">
          <h3>1. Candidate & Role Data</h3>
          
          <div className="form-group">
            <label>Resume Content *</label>
            <textarea
              rows={7}
              placeholder="Paste your resume or CV content..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Target Job Description</label>
            <textarea
              rows={7}
              placeholder="Paste target job description to match keywords and tailor interview questions..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>

          <button 
            className="btn-generate-prep"
            onClick={handleGeneratePrep}
            disabled={loading}
          >
            {loading ? "⚡ Coach Agent Analyzing..." : "🎓 Generate Interview Questions & Keywords"}
          </button>

          {agentStatus && <div className="agent-status-badge">{agentStatus}</div>}
        </div>

        {/* Right Card: Output & Keyword Finder */}
        <div className="results-card">
          {/* Keyword Alignment Section */}
          <div className="keyword-section">
            <h3>🔑 JD Keyword Finder & Skill Gap Analysis</h3>
            
            <div className="keyword-chips-container">
              <div className="chip-group">
                <span className="chip-label text-success">✓ Verified Matching Skills:</span>
                <div className="chips-wrapper">
                  {keywords.matching.length > 0 ? (
                    keywords.matching.map((skill, i) => (
                      <span key={i} className="chip chip-matching">{skill}</span>
                    ))
                  ) : (
                    <span className="no-data">Run analysis to see matching keywords.</span>
                  )}
                </div>
              </div>

              <div className="chip-group">
                <span className="chip-label text-warning">⚠️ Recommended Additions / Gaps:</span>
                <div className="chips-wrapper">
                  {keywords.missing.length > 0 ? (
                    keywords.missing.map((skill, i) => (
                      <span key={i} className="chip chip-missing">{skill}</span>
                    ))
                  ) : (
                    <span className="no-data">No critical skill gaps detected.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <hr className="divider" />

          {/* Interview Questions Section */}
          <div className="questions-section">
            <h3>💬 Tailored Interview Questions (STAR Method)</h3>
            
            {questions.length > 0 ? (
              <div className="questions-list">
                {questions.map((q, idx) => (
                  <div key={idx} className="question-card">
                    <div className="q-badge">{q.section || `Question ${idx + 1}`}</div>
                    <h4 className="q-title">{q.question}</h4>
                    <p className="q-intent"><strong>Evaluates:</strong> {q.intent}</p>
                    <div className="q-approach">
                      <strong>💡 Recommended STAR Strategy:</strong>
                      <p>{q.suggested_approach}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="placeholder-text">
                <p>Click "Generate" to receive tailored STAR interview questions built specifically for your profile.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
