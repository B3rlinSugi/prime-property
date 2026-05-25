import React from 'react';

interface LogoProps {
  height?: number;
  light?: boolean; // If true, renders with light colors (white text) for dark backgrounds
  showText?: boolean;
}

export default function Logo({ height = 48, light = false, showText = true }: LogoProps) {
  // Scale calculations based on height
  const width = showText ? (height * 3.2) : height;
  const textColor = '#FFFFFF'; // Force premium white text for dark luxury theme
  const accentColor = '#C9A961'; // Gold Accent

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      aria-label="Prime Property Logo"
    >
      {/* ─── LOGO MARK (SYMBOL) ─── */}
      <g transform="translate(10, 10)">
        {/* Gold Hexagon Outline */}
        <polygon
          points="40,5 75,25 75,65 40,85 5,65 5,25"
          stroke={accentColor}
          strokeWidth="3.5"
          strokeLinejoin="round"
          fill="rgba(201, 169, 97, 0.05)"
        />
        {/* House Line inside Hexagon */}
        <path
          d="M 22,50 L 40,32 L 58,50 L 58,68 L 22,68 Z"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinejoin="round"
          fill="none"
        />
        {/* House Door */}
        <path
          d="M 35,68 L 35,56 L 45,56 L 45,68"
          stroke={accentColor}
          strokeWidth="2.5"
          fill="none"
        />
      </g>

      {/* ─── LOGO TEXT (PRIME PROPERTY) ─── */}
      {showText && (
        <g transform="translate(105, 0)">
          {/* "PRIME" */}
          <text
            x="0"
            y="48"
            fill={textColor}
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '5px',
            }}
          >
            PRIME
          </text>
          
          {/* "PROPERTY" */}
          <text
            x="3"
            y="76"
            fill={accentColor}
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              letterSpacing: '8.5px',
            }}
          >
            PROPERTY
          </text>
        </g>
      )}
    </svg>
  );
}
