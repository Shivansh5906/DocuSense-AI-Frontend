import { useState } from "react";

const ARTICLES = [
  {
    id: 1,
    title: "How to Defeat the ATS Robot: Formatting Rules for 2026",
    category: "ats",
    summary: "Understand why columns, tables, headers, and custom fonts cause parsing failures in modern recruitment software. Learn how to structure a clean, linear resume.",
    readTime: "5 min read",
    author: "Bridget Vance (Recruiting Lead)",
    content: "Applicant Tracking Systems (ATS) are used by over 95% of Fortune 500 companies. However, many qualified candidates are filtered out due to simple formatting errors. Here are the core rules to follow:\n\n1. **Avoid Tables and Columns**: Traditional ATS software parses text from left to right, line by line. If you split your screen into two columns, the parser reads the first line of the left column directly into the first line of the right column, rendering the content incoherent.\n\n2. **Use Standard Fonts**: Stick to standard system fonts like Arial, Calibri, Times New Roman, or Garamond. Custom fonts often get corrupted during extraction.\n\n3. **Use Text Headers, Not Images**: Do not include contact information in image headers. The parser will skip them completely, leaving you without contact credentials in the database.\n\n4. **Linear Layout**: Organize sections vertically: Name/Contact -> Summary -> Experience -> Projects -> Education -> Skills. Use clear, textual section headers."
  },
  {
    id: 2,
    title: "The Google X-Y-Z Formula: Writing Results-Oriented CV Bullets",
    category: "resumes",
    summary: "Don't just list your tasks. Prove your impact. Use the gold standard X-Y-Z formula to rewrite boring responsibilities into metrics-driven achievements.",
    readTime: "4 min read",
    author: "Dave Chen (Technical Recruiter)",
    content: "Recruiters don't want to read a copy-paste of your job description's responsibilities. They want to see what you actually *accomplished*.\n\nGoogle's executive team popularized the **X-Y-Z Formula**:\n*Accomplished [X] as measured by [Y], by doing [Z].*\n\nLet's look at examples:\n- **Weak**: 'Responsible for updating the corporate website.'\n- **Google X-Y-Z**: 'Redesigned the corporate home screen (Z), reducing Initial Page Load Time by 35% (Y) and resulting in a 12% uplift in conversion registrations (X).'\n\n- **Weak**: 'Helped mentor junior developers.'\n- **Google X-Y-Z**: 'Mentored 4 junior engineers (Z), speeding up their codebase onboarding timeline by 50% (Y) and reducing post-release bugs by 15% (X).'\n\nAlways look for numeric indicators: percentages, absolute dollar amounts, time saved, or team count."
  },
  {
    id: 3,
    title: "Cracking the STAR Method in Technical Mock Interviews",
    category: "interviews",
    summary: "Master the Situation, Task, Action, and Result technique. Prepare structured answers that explain your problem-solving abilities and architecture choices.",
    readTime: "6 min read",
    author: "Marcus Vance (Engineering Manager)",
    content: "Behavioral questions like 'Tell me about a time you resolved a conflict' or 'Describe your most complex bug' are common. The STAR method ensures your answers remain structured and concise:\n\n1. **Situation**: Set the context. Describe the project, the size of the team, and what was at stake (1-2 sentences).\n\n2. **Task**: Explain the challenge or problem. Why was it difficult? What needed to be done immediately? (1-2 sentences).\n\n3. **Action**: Explain the exact steps *you* took. Focus on your contribution, not just the group. Describe code choices, architecture arguments, or conflict negotiations (3-4 sentences).\n\n4. **Result**: Describe the outcome. Use numbers to prove success. What did you learn? (2-3 sentences).\n\n*Pro-tip*: Always prepare 5 STAR stories in advance, mapping them to different categories: technical failure, team conflict, leading a feature, dealing with tight deadlines, and managing scope changes."
  },
  {
    id: 4,
    title: "Why Cold Outreach via LinkedIn Beats Online Applications",
    category: "outreach",
    summary: "Stop submitting your CV to the black hole of job boards. Learn how to draft concise cold outreach scripts targeting hiring managers directly.",
    readTime: "5 min read",
    author: "Sarah Johnson (Career Consultant)",
    content: "Applying on job boards yields an average response rate of under 5%. LinkedIn cold outreach, however, yields response rates of 20-30% if done correctly.\n\nHere is how to structure a winning cold outreach message (under 150 words):\n\n1. **Catchy Subject Line**: Focus on their project or a shared interest. (e.g., 'React Architecture at Acme Corp').\n\n2. **Acknowledge their work**: Show that you've researched them. Mention a recent blog post or product release.\n\n3. **Brief value proposition**: State your background and how it matches their immediate squad growth. Connect it to a metric.\n\n4. **Low-friction CTA**: Don't ask for a 30-minute call immediately. Ask a simple, low-pressure question instead. (e.g., 'Are you currently looking to expand your frontend resources this quarter?')."
  }
];

export default function CareerBlog() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filteredArticles = ARTICLES.filter((art) => {
    const matchesFilter = filter === "all" || art.category === filter;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="career-blog-container animate-fade-in">
      <div className="optimizer-header" style={{ marginBottom: "24px" }}>
        <h2>📚 Career & Resume Optimization Guide</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Recruiter tips, resume writing methodologies, and interview strategy guides.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="blog-controls" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "16px" }}>
        <div className="filter-pills" style={{ display: "flex", gap: "10px" }}>
          <button className={`tab-btn-pill ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
          <button className={`tab-btn-pill ${filter === "ats" ? "active" : ""}`} onClick={() => setFilter("ats")}>ATS Secrets</button>
          <button className={`tab-btn-pill ${filter === "resumes" ? "active" : ""}`} onClick={() => setFilter("resumes")}>Resumes</button>
          <button className={`tab-btn-pill ${filter === "interviews" ? "active" : ""}`} onClick={() => setFilter("interviews")}>Interviews</button>
          <button className={`tab-btn-pill ${filter === "outreach" ? "active" : ""}`} onClick={() => setFilter("outreach")}>Cold Outreach</button>
        </div>

        <input 
          type="text" 
          placeholder="🔍 Search guides..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ maxWidth: "300px", margin: 0, padding: "8px 12px" }}
        />
      </div>

      {/* Grid of Articles */}
      <div className="blog-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {filteredArticles.map((art) => (
          <div key={art.id} className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: "12px", transition: "var(--transition-smooth)" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.75rem", padding: "2px 8px", background: "rgba(99, 102, 241, 0.15)", color: "var(--primary-light)", borderRadius: "4px", fontWeight: "600", textTransform: "uppercase" }}>{art.category}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{art.readTime}</span>
              </div>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "1.2rem", color: "#fff" }}>{art.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: "1.4", margin: "0 0 20px 0" }}>{art.summary}</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>By {art.author}</span>
              <button 
                onClick={() => setSelectedArticle(art)} 
                className="view-report-btn" 
                style={{ padding: "6px 12px", fontSize: "0.8rem", cursor: "pointer", background: "transparent", color: "var(--primary-light)", border: "none" }}
              >
                Read Article ➔
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="empty-history-card" style={{ textAlign: "center", padding: "40px" }}>
          <span>📂</span>
          <h3>No Articles Found</h3>
          <p>We couldn't find any guides matching your criteria.</p>
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "700px", width: "90%", background: "#ffffff", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "28px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", padding: "2px 8px", background: "rgba(99, 102, 241, 0.15)", color: "var(--primary-light)", borderRadius: "4px", fontWeight: "600", textTransform: "uppercase" }}>{selectedArticle.category}</span>
              <button className="secondary-btn" onClick={() => setSelectedArticle(null)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-secondary)", fontSize: "1.2rem" }}>✖</button>
            </div>
            <h2 style={{ marginTop: 0, marginBottom: "8px", fontSize: "1.6rem", color: "var(--text-main)" }}>{selectedArticle.title}</h2>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "20px" }}>
              Written by <strong>{selectedArticle.author}</strong> | {selectedArticle.readTime}
            </div>
            
            <div className="doc-content-display" style={{ background: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
              <p style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-main)", margin: 0 }}>
                {selectedArticle.content}
              </p>
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="secondary-btn" style={{ padding: "8px 16px", borderRadius: "6px", background: "transparent", border: "1px solid var(--border-glass)", color: "var(--text-main)", cursor: "pointer" }} onClick={() => setSelectedArticle(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
