import { useState } from "react";
import "./ResumeBuilder.css"; // We'll centralize styling or use inline variables

export default function LandingDashboard({ onViewChange }) {
  const [activeTab, setActiveTab] = useState("graduates");
  const [pricingCycle, setPricingCycle] = useState("monthly"); // "monthly" or "annual"

  const featuresList = [
    {
      icon: "📄",
      title: "Resume Analyzer",
      desc: "Upload your resume and receive detailed AI-powered feedback on formatting, keywords, readability, and overall quality."
    },
    {
      icon: "🎯",
      title: "ATS Score Checker",
      desc: "See how well your resume performs against Applicant Tracking Systems used by leading companies."
    },
    {
      icon: "🤖",
      title: "AI Resume Optimizer",
      desc: "Improve weak bullet points, rewrite professional summaries, enhance achievements, and optimize keywords instantly."
    },
    {
      icon: "✍️",
      title: "AI Cover Letter Generator",
      desc: "Generate personalized cover letters tailored to your target company and job role within seconds."
    },
    {
      icon: "💼",
      title: "Job Match Analysis",
      desc: "Compare your resume with a job description and identify missing skills, experience gaps, and optimization opportunities."
    },
    {
      icon: "📊",
      title: "Skill Gap Analysis",
      desc: "Discover which technical and soft skills you need to improve for your dream role."
    },
    {
      icon: "📚",
      title: "Resume Templates",
      desc: "Choose from professionally designed ATS-friendly resume templates."
    },
    {
      icon: "☁",
      title: "Secure Cloud Workspace",
      desc: "Store resumes, cover letters, and reports securely and access them anytime."
    }
  ];

  const howItWorks = [
    {
      step: "1️⃣",
      title: "Upload Resume",
      desc: "Upload your PDF or DOCX resume."
    },
    {
      step: "2️⃣",
      title: "AI Analysis",
      desc: "DocuSense scans your resume for ATS compatibility, formatting issues, missing keywords, and improvement opportunities."
    },
    {
      step: "3️⃣",
      title: "Improve & Apply",
      desc: "Download an optimized resume, generate a cover letter, and apply with confidence."
    }
  ];

  const whyChooseDocuSense = [
    "ATS Score Prediction",
    "Resume Quality Report",
    "Grammar & Writing Suggestions",
    "Professional Resume Templates",
    "Cover Letter Generation",
    "Job Description Matching",
    "Keyword Optimization",
    "Secure Cloud Storage"
  ];

  const pricingPlans = [
    {
      name: "Basic Plan",
      price: 0,
      badge: "Free Starter",
      desc: "Essential features for casual job hunters to test out the builder.",
      features: [
        "1 Active Resume version",
        "Basic ATS Score Calculator",
        "3 AI Bullet Point optimizations",
        "Standard layout template",
        "Download as Web-print PDF"
      ],
      cta: "Start Building",
      action: () => onViewChange("builder")
    },
    {
      name: "Professional Plan",
      price: pricingCycle === "monthly" ? 19 : 12,
      badge: "Most Popular",
      desc: "Complete toolkit for active candidates looking to stand out.",
      features: [
        "Unlimited tailored resume versions",
        "Full AI Job Description Matching",
        "Unlimited Cover Letter generations",
        "LinkedIn Profile writer & headlines",
        "Advanced Templates (Modern, Slate, Emerald)",
        "Mock Interview prep questions generator",
        "Skills roadmap checklist"
      ],
      cta: "Upgrade to Pro",
      highlight: true,
      action: () => onViewChange("pricing")
    },
    {
      name: "Executive Plan",
      price: pricingCycle === "monthly" ? 39 : 28,
      badge: "Best Value",
      desc: "High-end optimization with personal career consulting elements.",
      features: [
        "Everything in Professional",
        "Priority Gemini-Ultra model endpoints",
        "Executive PDF styling formats",
        "Cold Email and LinkedIn recruiter outreach script bundles",
        "Resume audit report overview suggestions",
        "Priority customer support response"
      ],
      cta: "Go Executive",
      action: () => onViewChange("pricing")
    }
  ];

  const testimonials = [
    {
      name: "Kunal Saxena",
      role: "Senior Program Manager",
      avatar: "👨‍💻",
      comment: "I used the JD Matcher and tailored my resume for a Senior Role at a major company. The ATS score jumped from 54% to 88% and I received an interview request within 48 hours of applying!",
      stars: 5
    },
    {
      name: "Sarah Johnson",
      role: "Marketing Specialist",
      avatar: "👩‍💼",
      comment: "The AI Cover Letter generator is magic! It analyzed my resume and drafted a tone-perfect letter highlighting my campaigns. The recruiter explicitly complimented the letter in my first call.",
      stars: 5
    },
    {
      name: "David Chen",
      role: "Frontend Engineer",
      avatar: "👨‍🎨",
      comment: "The live preview with template styling made designing a CV incredibly satisfying. Being able to print directly to a clean PDF saved me hours of messing around with formatting in Word.",
      stars: 5
    }
  ];

  return (
    <div className="landing-dashboard-container animate-fade-in">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge-container" style={{ marginBottom: "16px" }}>
            <span className="hero-badge" style={{ background: "rgba(79, 70, 229, 0.08)", border: "1px solid rgba(79, 70, 229, 0.2)", padding: "6px 12px", borderRadius: "99px", fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>
              🚀 AI Powered • ATS Optimized • Recruiter Friendly
            </span>
          </div>
          
          <h1 className="hero-title" style={{ fontSize: "3.2rem", fontWeight: "800", color: "#0f172a", lineHeight: "1.15", letterSpacing: "-1.5px", margin: "0 0 16px 0" }}>
            Build a Resume <br />
            That Gets You Hired
          </h1>
          
          <p className="hero-desc" style={{ fontSize: "1.15rem", color: "#475569", lineHeight: "1.55", marginBottom: "28px", maxWidth: "580px" }}>
            Analyze, optimize, and create ATS-friendly resumes with AI. Get instant feedback, improve your resume, generate personalized cover letters, and discover jobs that match your skills.
          </p>

          <div className="hero-ctas">
            <button className="cta-primary-btn" onClick={() => onViewChange("review")}>
              🟡 Upload Resume
            </button>
            <button className="cta-secondary-btn" onClick={() => onViewChange("builder_select_template")}>
              ⚪ Build Resume
            </button>
          </div>
        </div>

        <div className="hero-graphics">
          <div className="mock-resume-card-preview">
            <div className="ats-badge-glow">ATS Optimized ⚡</div>
            
            <div className="mock-resume-single-layout">
              {/* Header */}
              <div className="mock-res-header">
                <h2>SEBASTIAN BENNETT</h2>
                <p className="mock-res-title">Professional Accountant</p>
                <div className="mock-res-contact-row">
                  <span>📞 +123-456-7890</span>
                  <span>✉️ hello@reallygreatsite.com</span>
                  <span>📍 123 Anywhere St., Any City</span>
                </div>
              </div>

              <div className="mock-res-body">
                {/* About Me */}
                <div className="mock-res-section">
                  <h3>ABOUT ME</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  </p>
                </div>

                {/* Education */}
                <div className="mock-res-section">
                  <h3>EDUCATION</h3>
                  
                  <div className="mock-res-item">
                    <div className="mock-res-item-meta">
                      <strong>Borcelle University</strong>
                      <span className="mock-res-year">2026-2030</span>
                    </div>
                    <span className="mock-res-role-label">Senior Accountant</span>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                  </div>

                  <div className="mock-res-item">
                    <div className="mock-res-item-meta">
                      <strong>Borcelle University</strong>
                      <span className="mock-res-year">2023-2026</span>
                    </div>
                    <span className="mock-res-role-label">Senior Accountant</span>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                  </div>
                </div>

                {/* Work Experience */}
                <div className="mock-res-section">
                  <h3>WORK EXPERIENCE</h3>
                  
                  <div className="mock-res-item">
                    <div className="mock-res-item-meta">
                      <strong>Salford & Co.</strong>
                      <span className="mock-res-year">2033 - 2035</span>
                    </div>
                    <span className="mock-res-role-label">Senior Accountant</span>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                  </div>

                  <div className="mock-res-item">
                    <div className="mock-res-item-meta">
                      <strong>Salford & Co.</strong>
                      <span className="mock-res-year">2030 - 2033</span>
                    </div>
                    <span className="mock-res-role-label">Financial Accountant</span>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="mock-res-section no-border">
                  <h3>SKILLS</h3>
                  <div className="mock-res-skills-grid">
                    <ul>
                      <li>• Auditing</li>
                      <li>• Financial Accounting</li>
                    </ul>
                    <ul>
                      <li>• Auditing</li>
                      <li>• Financial Accounting</li>
                    </ul>
                    <ul>
                      <li>• Financial Reporting</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mock-res-footer-bar"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Grid Banner */}
      <section className="features-section" style={{ padding: "60px 0" }}>
        <div className="section-header" style={{ marginBottom: "40px", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#0f172a" }}>Everything You Need to Land Your Dream Job</h2>
          <p style={{ color: "#64748b" }}>DocuSense provides advanced AI integrations to streamline your application pipeline.</p>
        </div>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", border: "none", paddingTop: "0" }}>
          {featuresList.map((f, idx) => (
            <div key={idx} className="feature-card card" style={{ background: "#ffffff", border: "1px solid rgba(15, 23, 42, 0.06)", padding: "28px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)" }}>
              <span className="feature-icon" style={{ fontSize: "2rem", display: "block", marginBottom: "15px" }}>{f.icon}</span>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", marginBottom: "10px" }}>{f.title}</h4>
              <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.5" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Section: How It Works */}
      <section className="how-works-section" style={{ padding: "60px 0", borderTop: "1px solid rgba(15, 23, 42, 0.05)" }}>
        <div className="section-header" style={{ marginBottom: "45px", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#0f172a" }}>Three Simple Steps</h2>
          <p style={{ color: "#64748b" }}>Go from a raw draft to interview invites in minutes.</p>
        </div>

        <div className="how-works-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "30px" }}>
          {howItWorks.map((item, idx) => (
            <div key={idx} className="how-step-card card" style={{ background: "#ffffff", border: "1px solid rgba(15, 23, 42, 0.06)", padding: "30px", borderRadius: "12px", position: "relative" }}>
              <div className="step-number-badge" style={{ fontSize: "2.2rem", marginBottom: "16px" }}>{item.step}</div>
              <h4 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#0f172a", marginBottom: "10px" }}>{item.title}</h4>
              <p style={{ fontSize: "0.92rem", color: "#475569", lineHeight: "1.5" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Section: Why Choose DocuSense */}
      <section className="why-choose-section" style={{ padding: "60px 0", borderTop: "1px solid rgba(15, 23, 42, 0.05)", marginBottom: "40px" }}>
        <div className="section-header" style={{ marginBottom: "40px", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#0f172a" }}>Smart AI That Understands Recruiters</h2>
          <p style={{ color: "#64748b" }}>Engineered around recruiting heuristics and ATS scanning logic to optimize parsing success.</p>
        </div>

        <div className="why-choose-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          {whyChooseDocuSense.map((bullet, idx) => (
            <div key={idx} className="why-bullet-card" style={{ background: "#ffffff", border: "1px solid rgba(15, 23, 42, 0.06)", padding: "20px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 10px rgba(15, 23, 42, 0.01)" }}>
              <span className="bullet-check-icon" style={{ color: "#10b981", fontSize: "1.1rem", fontWeight: "700" }}>✔</span>
              <span style={{ fontSize: "0.92rem", color: "#334155", fontWeight: "600" }}>{bullet}</span>
            </div>
          ))}
        </div>
      </section>


    </div>
  );
}
