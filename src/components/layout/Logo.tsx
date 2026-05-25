import React from 'react';

interface LogoProps {
  height?: number;
  light?: boolean; // If true, renders with light colors (white text) for dark backgrounds
  showText?: boolean;
}

export default function Logo({ height = 48, light = false, showText = true }: LogoProps) {
  // Scale calculations based on height
  const width = showText ? (height * 3.2) : height;
  const textColor = light ? '#FFFFFF' : '#1A1A1A';
  const rightSymbolColor = light ? '#FFFFFF' : '#1A1A1A';

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
      <g>
        {/* Left Gold Shape (Angled up-right) */}
        <path
          d="M 25,65 L 50,30 L 50,85 L 38,85 L 38,48 Z"
          fill="#C9A961"
        />
        {/* Center Red Pillar */}
        <path
          d="M 54,30 L 66,30 L 66,85 L 54,85 Z"
          fill="#B33A3A"
        />
        {/* Right Dark/White Shape (Angled up-left) */}
        <path
          d="M 95,65 L 70,30 L 70,85 L 82,85 L 82,48 Z"
          fill={rightSymbolColor}
        />
      </g>

      {/* ─── LOGO TEXT (PRIME PROPERTY) ─── */}
      {showText && (
        <g transform="translate(115, 0)">
          {/* "PRIME" - Bold, Modern, Geometric */}
          <text
            x="0"
            y="48"
            fill={textColor}
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: '34px',
              fontWeight: 800,
              letterSpacing: '5px',
            }}
          >
            PRIME
          </text>
          
          {/* Divider Horizontal Lines & "PROPERTY" */}
          {/* Left line */}
          <line
            x1="3"
            y1="72"
            x2="35"
            y2="72"
            stroke={textColor}
            strokeWidth="1.5"
            opacity="0.8"
          />
          {/* "PROPERTY" text */}
          <text
            x="45"
            y="76"
            fill={textColor}
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '3px',
            }}
          >
            PROPERTY
          </text>
          {/* Right line */}
          <line
            x1="126"
            y1="72"
            x2="158"
            y2="72"
            stroke={textColor}
            strokeWidth="1.5"
            opacity="0.8"
          />
        </g>
      )}
    </svg>
  );
}
