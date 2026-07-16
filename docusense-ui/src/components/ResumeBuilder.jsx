import { useState, useEffect } from "react";
import api from "../api/client";
import "./ResumeBuilder.css";

const EXAMPLES = {
  software_engineer: {
    personal: {
      fullName: "Alex Rivera",
      jobTitle: "Senior Frontend Engineer",
      email: "alex.rivera@devmail.com",
      phone: "+1 (555) 019-2834",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/alex-rivera",
      website: "alexrivera.dev"
    },
    summary: "Dynamic and results-driven Senior Frontend Engineer with 6+ years of experience designing, building, and optimizing high-performance web applications. Expert in React, TypeScript, and modern state management. Proven track record of improving web performance metrics by up to 40% and leading cross-functional engineering teams.",
    experience: [
      {
        title: "Senior Frontend Engineer",
        company: "TechNexus Corp",
        location: "San Francisco, CA",
        startYear: "2023",
        endYear: "Present",
        description: "Led development of a core cloud analytics dashboard, migrating legacy Angular screens to React/TypeScript.\nOptimized bundle sizes and lazy-loaded modules, achieving a 35% reduction in Initial Page Load Time (LCP).\nMentored 4 junior developers and established code review pipelines, reducing production bugs by 22%."
      },
      {
        title: "Software Engineer II",
        company: "SaaSify Inc",
        location: "Oakland, CA",
        startYear: "2020",
        endYear: "2023",
        description: "Implemented real-time data streaming widgets using WebSockets and Redux Toolkit, increasing dashboard interactivity.\nDesigned and published a reusable UI component library using CSS variables and React, reducing designer-to-developer handoff time by 50%.\nWorked closely with product owners to deliver 12+ enterprise features on-time."
      }
    ],
    education: [
      {
        degree: "B.S. in Computer Science",
        school: "University of California, Berkeley",
        location: "Berkeley, CA",
        startYear: "2016",
        endYear: "2020",
        description: "Graduated with Honors. Specialization in Human-Computer Interaction."
      }
    ],
    projects: [
      {
        name: "DevCanvas UI Library",
        role: "Creator & Lead Maintainer",
        description: "An open-source React component library utilizing glassmorphic styles and optimized for screen-reader compliance.",
        tech: "React, TypeScript, CSS Variables"
      },
      {
        name: "SyncBoard Collaboration Tool",
        role: "Fullstack Architect",
        description: "A collaborative Kanban board with instant syncing, active state channels, and draggable tasks.",
        tech: "Node.js, Express, React, Socket.io"
      }
    ],
    skills: {
      technical: "JavaScript, TypeScript, React, Next.js, Redux, HTML5, CSS3, GraphQL, Webpack, Git",
      soft: "Technical Mentorship, Agile Methodology, Cross-functional Collaboration, System Design",
      tools: "VS Code, Figma, Webpack, JIRA, Docker, Netlify, Vercel"
    }
  },
  product_manager: {
    personal: {
      fullName: "Marcus Vance",
      jobTitle: "Senior Product Manager",
      email: "marcus.vance@prodmail.com",
      phone: "+1 (555) 043-9821",
      location: "Seattle, WA",
      linkedin: "linkedin.com/in/marcusvance",
      website: "vanceproducts.co"
    },
    summary: "Innovative Product Leader with 8+ years of experience directing life-cycle product development in the SaaS and E-commerce domains. Expert in turning raw market signals into successful feature roadmaps. Proven history of launching products that generated over $12M in annual recurring revenue (ARR).",
    experience: [
      {
        title: "Lead Product Manager",
        company: "CartBloom Systems",
        location: "Seattle, WA",
        startYear: "2022",
        endYear: "Present",
        description: "Defined roadmap and launched CartBloom Premium checkout, resulting in a 14% uplift in conversion rate.\nSpearheaded a data-driven personalization project using ML recommendations, expanding average order values by 18%.\nManaged a cross-functional squad of 14 designers, QA testers, and developers using Scrum."
      },
      {
        title: "Product Manager II",
        company: "PayStream Financial",
        location: "Bellevue, WA",
        startYear: "2018",
        endYear: "2022",
        description: "Managed the API payment integration suite, onboarding 400+ mid-market merchants.\nReduced merchant integration lifecycle from 21 days down to 4 days by redesigning developer documentation portals.\nConducted 60+ customer interviews annually to discover product gaps and validate product design prototypes."
      }
    ],
    education: [
      {
        degree: "M.B.A. in Product Management",
        school: "University of Washington",
        location: "Seattle, WA",
        startYear: "2016",
        endYear: "2018",
        description: "Focus on Tech Entrepreneurship and Operations."
      }
    ],
    projects: [
      {
        name: "CartBloom Analytics Dashboard",
        role: "Product Lead",
        description: "Launched internal tracking tool that maps user drop-off funnels in checkout paths.",
        tech: "Amplitude, SQL, Figma"
      }
    ],
    skills: {
      technical: "Product Roadmap, Market Research, User Analytics, SQL, Wireframing, Agile Scrum",
      soft: "Stakeholder Management, Public Speaking, Strategic Vision, Negotiation",
      tools: "Jira, Amplitude, Miro, Figma, Salesforce"
    }
  }
};

export default function ResumeBuilder({ selectedFilename, onSaveSuccess, initialTemplate = "modern" }) {
  const [template, setTemplate] = useState(initialTemplate); // "modern", "professional", "creative"
  
  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  const [activeFormTab, setActiveFormTab] = useState("personal"); // "personal", "summary", "experience", "education", "projects", "skills"
  
  // Builder Data State
  const [personal, setPersonal] = useState({
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: ""
  });
  
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState({
    technical: "",
    soft: "",
    tools: ""
  });

  // Modal States
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveVersionName, setSaveVersionName] = useState("");
  const [saving, setSaving] = useState(false);

  // Initialize with software engineer example so it doesn't start completely blank
  useEffect(() => {
    loadExample("software_engineer");
  }, []);

  const loadExample = (key) => {
    const ex = EXAMPLES[key];
    if (ex) {
      setPersonal(ex.personal);
      setSummary(ex.summary);
      setExperience(ex.experience);
      setEducation(ex.education);
      setProjects(ex.projects);
      setSkills(ex.skills);
    }
  };

  // State Mutators for Dynamic Lists
  const addExperience = () => {
    setExperience([...experience, { title: "", company: "", location: "", startYear: "", endYear: "", description: "" }]);
  };
  const updateExperience = (idx, field, value) => {
    const updated = [...experience];
    updated[idx][field] = value;
    setExperience(updated);
  };
  const deleteExperience = (idx) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const addEducation = () => {
    setEducation([...education, { degree: "", school: "", location: "", startYear: "", endYear: "", description: "" }]);
  };
  const updateEducation = (idx, field, value) => {
    const updated = [...education];
    updated[idx][field] = value;
    setEducation(updated);
  };
  const deleteEducation = (idx) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const addProject = () => {
    setProjects([...projects, { name: "", role: "", description: "", tech: "" }]);
  };
  const updateProject = (idx, field, value) => {
    const updated = [...projects];
    updated[idx][field] = value;
    setProjects(updated);
  };
  const deleteProject = (idx) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  // Compile Resume details into a structured Markdown format for AI matching
  const compileResumeToMarkdown = () => {
    let md = `# ${personal.fullName || "Untitled Resume"}\n`;
    md += `**Title:** ${personal.jobTitle || ""}\n`;
    md += `**Email:** ${personal.email || ""} | **Phone:** ${personal.phone || ""} | **Location:** ${personal.location || ""}\n`;
    if (personal.linkedin) md += `**LinkedIn:** ${personal.linkedin} `;
    if (personal.website) md += `**Website:** ${personal.website}`;
    md += `\n\n## Professional Summary\n${summary}\n\n`;
    
    md += `## Work Experience\n`;
    experience.forEach((e) => {
      md += `### ${e.title} - ${e.company}\n`;
      md += `*${e.location} | ${e.startYear} - ${e.endYear}*\n`;
      md += `${e.description}\n\n`;
    });
    
    md += `## Education\n`;
    education.forEach((edu) => {
      md += `### ${edu.degree}\n`;
      md += `*${edu.school} (${edu.startYear} - ${edu.endYear})*\n`;
      if (edu.description) md += `${edu.description}\n`;
      md += `\n`;
    });

    md += `## Key Projects\n`;
    projects.forEach((p) => {
      md += `### ${p.name} - ${p.role}\n`;
      if (p.tech) md += `*Technologies: ${p.tech}*\n`;
      md += `${p.description}\n\n`;
    });

    md += `## Technical Skills\n${skills.technical}\n\n`;
    md += `## Soft Skills\n${skills.soft}\n\n`;
    md += `## Tools & Systems\n${skills.tools}\n`;
    return md;
  };

  const handleSaveVersion = async () => {
    if (!saveVersionName.trim()) {
      alert("Please enter a version name.");
      return;
    }
    if (!selectedFilename) {
      alert("Please select a base resume in the sidebar to clone/attach this version to.");
      return;
    }
    
    setSaving(true);
    try {
      const markdownContent = compileResumeToMarkdown();
      await api.post("/resume/versions", {
        filename: selectedFilename,
        version_name: saveVersionName,
        tailored_text: markdownContent
      });
      alert(`Resume saved successfully as tailored version "${saveVersionName}"!`);
      setShowSaveModal(false);
      setSaveVersionName("");
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error("Failed to save resume version", err);
      alert("Error saving tailored version. Ensure a document is selected.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="resume-builder-container">
      {/* Controls Header */}
      <div className="builder-top-bar">
        <div className="template-controls">
          <label>Layout Style:</label>
          <div className="btn-group-segmented">
            <button className={`segment-btn ${template === "modern" ? "active" : ""}`} onClick={() => setTemplate("modern")}>Modern</button>
            <button className={`segment-btn ${template === "professional" ? "active" : ""}`} onClick={() => setTemplate("professional")}>Professional</button>
            <button className={`segment-btn ${template === "creative" ? "active" : ""}`} onClick={() => setTemplate("creative")}>Creative</button>
          </div>
        </div>

        <div className="examples-controls">
          <label>Pre-fill Example:</label>
          <select onChange={(e) => loadExample(e.target.value)} defaultValue="software_engineer" className="example-select-dropdown">
            <option value="software_engineer">Software Engineer</option>
            <option value="product_manager">Product Manager</option>
          </select>
        </div>

        <div className="action-buttons">
          <button className="secondary-btn" onClick={handlePrint}>
            🖨️ Download PDF / Print
          </button>
          <button className="primary-btn" onClick={() => setShowSaveModal(true)} disabled={!selectedFilename} title={!selectedFilename ? "Upload a base resume first" : "Save as active version"}>
            💾 Save Version
          </button>
        </div>
      </div>

      <div className="builder-workspace-grid">
        {/* Left Side: Accordion Input Form */}
        <div className="builder-form-panel card">
          <div className="form-tabs-headers">
            <button className={`form-tab-link ${activeFormTab === "personal" ? "active" : ""}`} onClick={() => setActiveFormTab("personal")}>Contact</button>
            <button className={`form-tab-link ${activeFormTab === "summary" ? "active" : ""}`} onClick={() => setActiveFormTab("summary")}>Summary</button>
            <button className={`form-tab-link ${activeFormTab === "experience" ? "active" : ""}`} onClick={() => setActiveFormTab("experience")}>Experience ({experience.length})</button>
            <button className={`form-tab-link ${activeFormTab === "education" ? "active" : ""}`} onClick={() => setActiveFormTab("education")}>Education ({education.length})</button>
            <button className={`form-tab-link ${activeFormTab === "projects" ? "active" : ""}`} onClick={() => setActiveFormTab("projects")}>Projects ({projects.length})</button>
            <button className={`form-tab-link ${activeFormTab === "skills" ? "active" : ""}`} onClick={() => setActiveFormTab("skills")}>Skills</button>
          </div>

          <div className="form-tab-body">
            {/* PERSONAL INFO */}
            {activeFormTab === "personal" && (
              <div className="form-section-fields animate-fade-in">
                <h3>Contact & Header Details</h3>
                <div className="field-grid-2">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={personal.fullName} onChange={(e) => setPersonal({...personal, fullName: e.target.value})} placeholder="e.g. Sarah Johnson" />
                  </div>
                  <div className="form-group">
                    <label>Target Professional Title</label>
                    <input type="text" value={personal.jobTitle} onChange={(e) => setPersonal({...personal, jobTitle: e.target.value})} placeholder="e.g. Senior Product Marketer" />
                  </div>
                </div>
                <div className="field-grid-2">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={personal.email} onChange={(e) => setPersonal({...personal, email: e.target.value})} placeholder="sarah@example.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" value={personal.phone} onChange={(e) => setPersonal({...personal, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <div className="field-grid-2">
                  <div className="form-group">
                    <label>Location (City, State)</label>
                    <input type="text" value={personal.location} onChange={(e) => setPersonal({...personal, location: e.target.value})} placeholder="San Francisco, CA" />
                  </div>
                  <div className="form-group">
                    <label>LinkedIn URL</label>
                    <input type="text" value={personal.linkedin} onChange={(e) => setPersonal({...personal, linkedin: e.target.value})} placeholder="linkedin.com/in/username" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Portfolio / Website</label>
                  <input type="text" value={personal.website} onChange={(e) => setPersonal({...personal, website: e.target.value})} placeholder="myportfolio.dev" />
                </div>
              </div>
            )}

            {/* SUMMARY */}
            {activeFormTab === "summary" && (
              <div className="form-section-fields animate-fade-in">
                <h3>Professional Summary</h3>
                <p className="field-guideline">Provide a brief, compelling introduction highlighting your main values, top expertise, and major career goals (typically 3-4 sentences).</p>
                <div className="form-group">
                  <textarea rows={8} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A results-oriented career specialist with expertise in..." className="builder-textarea-large"></textarea>
                </div>
              </div>
            )}

            {/* EXPERIENCE */}
            {activeFormTab === "experience" && (
              <div className="form-section-fields animate-fade-in">
                <div className="section-title-action">
                  <h3>Work Experience</h3>
                  <button className="add-btn-pill" onClick={addExperience}>+ Add Job</button>
                </div>

                {experience.length === 0 ? (
                  <p className="no-items-placeholder">No experience entries added. Click 'Add Job' to begin.</p>
                ) : (
                  <div className="items-accordion-list">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="nested-item-card">
                        <div className="item-card-header">
                          <h4>Job #{idx + 1}: {exp.title || "Untitled Role"}</h4>
                          <button className="delete-icon-btn" onClick={() => deleteExperience(idx)}>🗑️</button>
                        </div>
                        <div className="field-grid-2">
                          <div className="form-group">
                            <label>Designation / Job Title</label>
                            <input type="text" value={exp.title} onChange={(e) => updateExperience(idx, "title", e.target.value)} placeholder="e.g. Lead Developer" />
                          </div>
                          <div className="form-group">
                            <label>Company Name</label>
                            <input type="text" value={exp.company} onChange={(e) => updateExperience(idx, "company", e.target.value)} placeholder="e.g. Acme Corp" />
                          </div>
                        </div>
                        <div className="field-grid-3">
                          <div className="form-group">
                            <label>Location</label>
                            <input type="text" value={exp.location} onChange={(e) => updateExperience(idx, "location", e.target.value)} placeholder="New York, NY" />
                          </div>
                          <div className="form-group">
                            <label>Start Year</label>
                            <input type="text" value={exp.startYear} onChange={(e) => updateExperience(idx, "startYear", e.target.value)} placeholder="2021" />
                          </div>
                          <div className="form-group">
                            <label>End Year (or Present)</label>
                            <input type="text" value={exp.endYear} onChange={(e) => updateExperience(idx, "endYear", e.target.value)} placeholder="Present" />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Responsibilities & Outcomes</label>
                          <textarea rows={5} value={exp.description} onChange={(e) => updateExperience(idx, "description", e.target.value)} placeholder="Accomplished [X] as measured by [Y], by doing [Z]..."></textarea>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EDUCATION */}
            {activeFormTab === "education" && (
              <div className="form-section-fields animate-fade-in">
                <div className="section-title-action">
                  <h3>Education Credentials</h3>
                  <button className="add-btn-pill" onClick={addEducation}>+ Add Education</button>
                </div>

                {education.length === 0 ? (
                  <p className="no-items-placeholder">No education records added. Click 'Add Education' to start.</p>
                ) : (
                  <div className="items-accordion-list">
                    {education.map((edu, idx) => (
                      <div key={idx} className="nested-item-card">
                        <div className="item-card-header">
                          <h4>Academic #{idx + 1}: {edu.degree || "Degree"}</h4>
                          <button className="delete-icon-btn" onClick={() => deleteEducation(idx)}>🗑️</button>
                        </div>
                        <div className="field-grid-2">
                          <div className="form-group">
                            <label>Degree & Major</label>
                            <input type="text" value={edu.degree} onChange={(e) => updateEducation(idx, "degree", e.target.value)} placeholder="e.g. B.S. in Computer Science" />
                          </div>
                          <div className="form-group">
                            <label>School Name</label>
                            <input type="text" value={edu.school} onChange={(e) => updateEducation(idx, "school", e.target.value)} placeholder="e.g. Stanford University" />
                          </div>
                        </div>
                        <div className="field-grid-3">
                          <div className="form-group">
                            <label>Location</label>
                            <input type="text" value={edu.location} onChange={(e) => updateEducation(idx, "location", e.target.value)} placeholder="Stanford, CA" />
                          </div>
                          <div className="form-group">
                            <label>Start Year</label>
                            <input type="text" value={edu.startYear} onChange={(e) => updateEducation(idx, "startYear", e.target.value)} placeholder="2018" />
                          </div>
                          <div className="form-group">
                            <label>Graduation Year</label>
                            <input type="text" value={edu.endYear} onChange={(e) => updateEducation(idx, "endYear", e.target.value)} placeholder="2022" />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Description / GPA / Activities (Optional)</label>
                          <textarea rows={3} value={edu.description} onChange={(e) => updateEducation(idx, "description", e.target.value)} placeholder="Graduated GPA 3.8/4.0..."></textarea>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROJECTS */}
            {activeFormTab === "projects" && (
              <div className="form-section-fields animate-fade-in">
                <div className="section-title-action">
                  <h3>Key Projects</h3>
                  <button className="add-btn-pill" onClick={addProject}>+ Add Project</button>
                </div>

                {projects.length === 0 ? (
                  <p className="no-items-placeholder">No project records added. Click 'Add Project' to begin.</p>
                ) : (
                  <div className="items-accordion-list">
                    {projects.map((proj, idx) => (
                      <div key={idx} className="nested-item-card">
                        <div className="item-card-header">
                          <h4>Project #{idx + 1}: {proj.name || "Project Name"}</h4>
                          <button className="delete-icon-btn" onClick={() => deleteProject(idx)}>🗑️</button>
                        </div>
                        <div className="field-grid-2">
                          <div className="form-group">
                            <label>Project Name</label>
                            <input type="text" value={proj.name} onChange={(e) => updateProject(idx, "name", e.target.value)} placeholder="e.g. MyPort Ecommerce App" />
                          </div>
                          <div className="form-group">
                            <label>Your Role</label>
                            <input type="text" value={proj.role} onChange={(e) => updateProject(idx, "role", e.target.value)} placeholder="e.g. Solo Developer / Team Lead" />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Technologies Used</label>
                          <input type="text" value={proj.tech} onChange={(e) => updateProject(idx, "tech", e.target.value)} placeholder="e.g. React, Node.js, AWS" />
                        </div>
                        <div className="form-group">
                          <label>Description & Outcomes</label>
                          <textarea rows={4} value={proj.description} onChange={(e) => updateProject(idx, "description", e.target.value)} placeholder="Designed backend architecture that served 10k users..."></textarea>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SKILLS */}
            {activeFormTab === "skills" && (
              <div className="form-section-fields animate-fade-in">
                <h3>Skills Categorization</h3>
                <p className="field-guideline">List keywords separated by commas. These will feed the ATS scoring parameters and keyword matchers.</p>
                <div className="form-group">
                  <label>Technical Skills (Languages, Frameworks, Tech Stacks)</label>
                  <textarea rows={3} value={skills.technical} onChange={(e) => setSkills({...skills, technical: e.target.value})} placeholder="e.g. JavaScript, Python, React, AWS, Docker"></textarea>
                </div>
                <div className="form-group">
                  <label>Soft Skills (Interpersonal, Processes)</label>
                  <textarea rows={3} value={skills.soft} onChange={(e) => setSkills({...skills, soft: e.target.value})} placeholder="e.g. Project Leadership, Mentoring, Agile Methodology"></textarea>
                </div>
                <div className="form-group">
                  <label>Tools & Software (Applications, Services)</label>
                  <textarea rows={3} value={skills.tools} onChange={(e) => setSkills({...skills, tools: e.target.value})} placeholder="e.g. Git, Figma, JIRA, VS Code, Amplitude"></textarea>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live A4 Preview sheet */}
        <div className="builder-preview-panel">
          <div className="preview-instructions">
            <span>✨ Live A4 Document Sheet View</span>
          </div>

          <div id="resume-printable-area" className={`a4-page-sheet template-${template}`}>
            {/* MODERN TEMPLATE */}
            {template === "modern" && (
              <div className="modern-layout-flow">
                <header className="modern-header">
                  <h1>{personal.fullName || "Candidate Name"}</h1>
                  <p className="modern-job-title">{personal.jobTitle || "Job Designation Title"}</p>
                  
                  <div className="modern-contact-details">
                    {personal.email && <span>📧 {personal.email}</span>}
                    {personal.phone && <span>📞 {personal.phone}</span>}
                    {personal.location && <span>📍 {personal.location}</span>}
                    {personal.linkedin && <span>🔗 {personal.linkedin}</span>}
                    {personal.website && <span>🌐 {personal.website}</span>}
                  </div>
                </header>

                {summary && (
                  <section className="modern-section">
                    <h3>Professional Summary</h3>
                    <p className="section-para">{summary}</p>
                  </section>
                )}

                {experience.length > 0 && (
                  <section className="modern-section">
                    <h3>Work History</h3>
                    <div className="timeline-list">
                      {experience.map((exp, i) => (
                        <div key={i} className="timeline-item">
                          <div className="timeline-meta">
                            <span className="job-title">{exp.title || "Position Title"}</span>
                            <span className="job-date">{exp.startYear || "Start"} - {exp.endYear || "End"}</span>
                          </div>
                          <div className="company-info">{exp.company || "Company"} | {exp.location || "Location"}</div>
                          {exp.description && <p className="job-desc">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {education.length > 0 && (
                  <section className="modern-section">
                    <h3>Education</h3>
                    <div className="timeline-list">
                      {education.map((edu, i) => (
                        <div key={i} className="timeline-item">
                          <div className="timeline-meta">
                            <span className="job-title">{edu.degree || "Degree Detail"}</span>
                            <span className="job-date">{edu.startYear || "Start"} - {edu.endYear || "End"}</span>
                          </div>
                          <div className="company-info">{edu.school || "School"} | {edu.location || "Location"}</div>
                          {edu.description && <p className="job-desc">{edu.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {projects.length > 0 && (
                  <section className="modern-section">
                    <h3>Key Projects</h3>
                    <div className="timeline-list">
                      {projects.map((p, i) => (
                        <div key={i} className="timeline-item">
                          <div className="timeline-meta">
                            <span className="job-title">{p.name || "Project Name"}</span>
                            <span className="job-date">{p.role || "Role"}</span>
                          </div>
                          {p.tech && <div className="company-info">Technologies: {p.tech}</div>}
                          {p.description && <p className="job-desc">{p.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {(skills.technical || skills.soft || skills.tools) && (
                  <section className="modern-section">
                    <h3>Skills & Toolkit</h3>
                    <div className="skills-categories-grid">
                      {skills.technical && (
                        <div className="skills-block-row">
                          <strong>Technical Stack:</strong> {skills.technical}
                        </div>
                      )}
                      {skills.soft && (
                        <div className="skills-block-row">
                          <strong>Professional Competencies:</strong> {skills.soft}
                        </div>
                      )}
                      {skills.tools && (
                        <div className="skills-block-row">
                          <strong>Tools & Environments:</strong> {skills.tools}
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* PROFESSIONAL TEMPLATE */}
            {template === "professional" && (
              <div className="professional-layout-flow">
                <header className="professional-header text-center">
                  <h1>{personal.fullName || "Candidate Name"}</h1>
                  <div className="professional-contact-inline">
                    {personal.email && <span>{personal.email}</span>}
                    {personal.phone && <span>{personal.phone}</span>}
                    {personal.location && <span>{personal.location}</span>}
                  </div>
                  <div className="professional-links-inline">
                    {personal.linkedin && <span>LinkedIn: {personal.linkedin}</span>}
                    {personal.website && <span>Portfolio: {personal.website}</span>}
                  </div>
                  <p className="professional-job-title">{personal.jobTitle || "Job Designation Title"}</p>
                </header>

                {summary && (
                  <section className="professional-section">
                    <h3 className="section-divider-title">Executive Summary</h3>
                    <p className="section-para">{summary}</p>
                  </section>
                )}

                {experience.length > 0 && (
                  <section className="professional-section">
                    <h3 className="section-divider-title">Professional Experience</h3>
                    <div className="prof-list">
                      {experience.map((exp, i) => (
                        <div key={i} className="prof-item">
                          <div className="prof-header">
                            <div><strong>{exp.company || "Company"}</strong>, {exp.location || "Location"}</div>
                            <div>{exp.startYear || "Start"} – {exp.endYear || "End"}</div>
                          </div>
                          <div className="prof-title-line"><em>{exp.title || "Position Title"}</em></div>
                          {exp.description && <p className="prof-desc">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {education.length > 0 && (
                  <section className="professional-section">
                    <h3 className="section-divider-title">Education</h3>
                    <div className="prof-list">
                      {education.map((edu, i) => (
                        <div key={i} className="prof-item">
                          <div className="prof-header">
                            <div><strong>{edu.school || "School"}</strong>, {edu.location || "Location"}</div>
                            <div>{edu.startYear || "Start"} – {edu.endYear || "End"}</div>
                          </div>
                          <div className="prof-title-line"><em>{edu.degree || "Degree"}</em></div>
                          {edu.description && <p className="prof-desc">{edu.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {projects.length > 0 && (
                  <section className="professional-section">
                    <h3 className="section-divider-title">Key Projects</h3>
                    <div className="prof-list">
                      {projects.map((p, i) => (
                        <div key={i} className="prof-item">
                          <div className="prof-header">
                            <div><strong>{p.name || "Project Name"}</strong> — {p.role || "Role"}</div>
                            {p.tech && <div>{p.tech}</div>}
                          </div>
                          {p.description && <p className="prof-desc">{p.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {(skills.technical || skills.soft || skills.tools) && (
                  <section className="professional-section">
                    <h3 className="section-divider-title">Core Skills & Systems</h3>
                    <table className="skills-table-preview">
                      <tbody>
                        {skills.technical && (
                          <tr>
                            <td className="skill-cell-label">Technical Stacks:</td>
                            <td>{skills.technical}</td>
                          </tr>
                        )}
                        {skills.soft && (
                          <tr>
                            <td className="skill-cell-label">Methodologies:</td>
                            <td>{skills.soft}</td>
                          </tr>
                        )}
                        {skills.tools && (
                          <tr>
                            <td className="skill-cell-label">Tools/Platforms:</td>
                            <td>{skills.tools}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </section>
                )}
              </div>
            )}

            {/* CREATIVE TEMPLATE */}
            {template === "creative" && (
              <div className="creative-layout-flow">
                {/* Left Sidebar */}
                <div className="creative-sidebar">
                  <div className="creative-avatar-decor">
                    {personal.fullName ? personal.fullName.charAt(0) : "CV"}
                  </div>
                  <h2>{personal.fullName || "Candidate Name"}</h2>
                  <p className="creative-job-title">{personal.jobTitle || "Target Title"}</p>

                  <div className="creative-sidebar-section">
                    <h4>Contact Info</h4>
                    <ul>
                      {personal.email && <li>📧 {personal.email}</li>}
                      {personal.phone && <li>📞 {personal.phone}</li>}
                      {personal.location && <li>📍 {personal.location}</li>}
                      {personal.linkedin && <li>🔗 {personal.linkedin}</li>}
                      {personal.website && <li>🌐 {personal.website}</li>}
                    </ul>
                  </div>

                  {skills.technical && (
                    <div className="creative-sidebar-section">
                      <h4>Tech Stacks</h4>
                      <p className="sidebar-comma-skills">{skills.technical}</p>
                    </div>
                  )}

                  {skills.soft && (
                    <div className="creative-sidebar-section">
                      <h4>Soft Skills</h4>
                      <p className="sidebar-comma-skills">{skills.soft}</p>
                    </div>
                  )}

                  {skills.tools && (
                    <div className="creative-sidebar-section">
                      <h4>Tools</h4>
                      <p className="sidebar-comma-skills">{skills.tools}</p>
                    </div>
                  )}
                </div>

                {/* Right Body */}
                <div className="creative-body">
                  {summary && (
                    <section className="creative-section">
                      <h3>About Me</h3>
                      <p className="section-para">{summary}</p>
                    </section>
                  )}

                  {experience.length > 0 && (
                    <section className="creative-section">
                      <h3>Professional Background</h3>
                      {experience.map((exp, i) => (
                        <div key={i} className="creative-block">
                          <div className="creative-block-header">
                            <div><strong>{exp.title}</strong> at {exp.company}</div>
                            <div className="date-tag">{exp.startYear} - {exp.endYear}</div>
                          </div>
                          <div className="location-tag">{exp.location}</div>
                          <p className="block-desc">{exp.description}</p>
                        </div>
                      ))}
                    </section>
                  )}

                  {education.length > 0 && (
                    <section className="creative-section">
                      <h3>Education Details</h3>
                      {education.map((edu, i) => (
                        <div key={i} className="creative-block">
                          <div className="creative-block-header">
                            <div><strong>{edu.degree}</strong></div>
                            <div className="date-tag">{edu.startYear} - {edu.endYear}</div>
                          </div>
                          <div className="location-tag">{edu.school} | {edu.location}</div>
                          {edu.description && <p className="block-desc">{edu.description}</p>}
                        </div>
                      ))}
                    </section>
                  )}

                  {projects.length > 0 && (
                    <section className="creative-section">
                      <h3>Key Projects</h3>
                      {projects.map((p, i) => (
                        <div key={i} className="creative-block">
                          <div className="creative-block-header">
                            <div><strong>{p.name}</strong></div>
                            <div className="date-tag">{p.role}</div>
                          </div>
                          {p.tech && <div className="location-tag">Stacks: {p.tech}</div>}
                          {p.description && <p className="block-desc">{p.description}</p>}
                        </div>
                      ))}
                    </section>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Version Name Modal */}
      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "450px", width: "90%", background: "#1f2937", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "24px" }}>
            <h2 style={{ marginTop: 0, marginBottom: "8px" }}>💾 Save Tailored Version</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
              Give this resume version a name. It will be cloned under the base document <strong>{selectedFilename}</strong> in the database so you can select it in the JD Matcher or cover letter generator.
            </p>
            <div className="input-group" style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", display: "block", marginBottom: "6px" }}>Version Name</label>
              <input
                type="text"
                placeholder="e.g. React Developer Focus"
                value={saveVersionName}
                onChange={(e) => setSaveVersionName(e.target.value)}
                className="form-input"
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="secondary-btn" style={{ padding: "8px 16px", borderRadius: "6px", background: "transparent", border: "1px solid var(--border-glass)", color: "#fff", cursor: "pointer" }} onClick={() => setShowSaveModal(false)}>Cancel</button>
              <button className="primary-btn" style={{ padding: "8px 16px", borderRadius: "6px", background: "var(--primary-gradient)", border: "none", color: "#fff", cursor: "pointer", fontWeight: "600" }} onClick={handleSaveVersion} disabled={saving}>
                {saving ? "Saving..." : "Save Version"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
