import React from "react";

export default function DocuSenseLogo({ showText = true, iconOnly = false, height = 36 }) {
  return (
    <div className="docusense-brand-logo" style={{ display: "inline-flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
      <svg
        width={height}
        height={height}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ borderRadius: "24%", overflow: "hidden", filter: "drop-shadow(0 4px 12px rgba(0, 210, 133, 0.25))" }}
      >
        <defs>
          <linearGradient id="docusense-bg-grad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0F9D58" />
            <stop offset="100%" stopColor="#0B7A44" />
          </linearGradient>
        </defs>
        
        {/* Rounded square container */}
        <rect width="120" height="120" rx="28" fill="url(#docusense-bg-grad)" />

        {/* Outer 'D' shape */}
        <path
          d="M 32 20 H 62 C 82 20 98 34 98 60 C 98 86 82 100 62 100 H 32 V 20 Z"
          fill="#ffffff"
        />
        
        {/* Inner Cutout inside D */}
        <path
          d="M 48 34 H 58 C 70 34 80 43 80 60 C 80 77 70 86 58 86 H 48 V 34 Z"
          fill="url(#docusense-bg-grad)"
        />

        {/* Document Icon inside D */}
        <g transform="translate(51, 41)">
          {/* Document Sheet */}
          <path
            d="M 2 0 H 14 L 20 6 V 34 H 2 Z"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Folded Corner */}
          <path d="M 14 0 V 6 H 20" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinejoin="round" />
          {/* Document Content Lines */}
          <line x1="6" y1="12" x2="16" y2="12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="6" y1="18" x2="16" y2="18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="6" y1="24" x2="13" y2="24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Pixel Particle Dispersion blocks on bottom-left */}
        <rect x="20" y="82" width="8" height="8" rx="2" fill="#0F9D58" />
        <rect x="12" y="90" width="7" height="7" rx="1.5" fill="#0F9D58" />
        <rect x="22" y="92" width="6" height="6" rx="1.5" fill="#0B7A44" />
        <rect x="10" y="99" width="5" height="5" rx="1" fill="#0F9D58" />
        <rect x="17" y="101" width="4" height="4" rx="1" fill="#ffffff" />
        <rect x="27" y="99" width="5" height="5" rx="1" fill="#0F9D58" />
        <rect x="28" y="90" width="5" height="5" rx="1" fill="#0B7A44" />
      </svg>

      {showText && !iconOnly && (
        <div className="docusense-logo-text" style={{ display: "flex", alignItems: "center", fontFamily: "'Inter', sans-serif" }}>
          <span style={{ fontSize: `${height * 0.72}px`, fontWeight: "800", color: "#FFFFFF", letterSpacing: "-0.5px" }}>
            Docu
          </span>
          <span style={{ fontSize: `${height * 0.72}px`, fontWeight: "700", color: "#0F9D58", letterSpacing: "-0.5px" }}>
            Sense
          </span>
        </div>
      )}
    </div>
  );
}
