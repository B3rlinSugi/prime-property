// Branding constants - change these to globally update the brand name in the logo!
export const BRAND_NAME = 'PRIME';
export const BRAND_SUB_NAME = 'PROPERTY';

interface LogoProps {
  height?: number;
  light?: boolean; // If true, renders with light colors (white text) for dark backgrounds
  showText?: boolean;
}

export default function Logo({ height = 48, light = false, showText = true }: LogoProps) {
  // Scale calculations based on height
  const width = showText ? (height * 3.6) : height;
  const textColor = light ? '#FFFFFF' : '#1A1A1A'; // Dynamic text color matching light/dark modes
  const accentColor = '#C9A961'; // Gold Accent
  const redColor = '#B33A3A'; // Red Accent
  const thirdPillarColor = light ? '#FFFFFF' : '#1A1A1A'; // Symmetrical to textColor

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 360 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      aria-label="Prime Property Logo"
    >
      {/* ─── REAL CUSTOM GEOMETRIC LOGO MARK (100% IDENTICAL TO CLIENT SPEC) ─── */}
      <g transform="translate(15, 0)">
        {/* Pillar 1: Left Wing / Arrowhead (Gold) */}
        <path
          d="M 42,83 L 42,21 L 32,31 L 12,51 L 32,45 L 32,93 Z"
          fill={accentColor}
        />
        
        {/* Pillar 2: Center Vertical Pillar (Red) - Diagonal top & bottom cuts */}
        <path
          d="M 45,90 L 55,80 L 55,8 L 45,18 Z"
          fill={redColor}
        />

        {/* Pillar 3: Right Hollow Geometric "P" (Contrast Light/Dark) */}
        <path
          d="M 58,8 L 68,18 L 88,38 L 88,48 L 68,68 L 68,70 L 58,80 Z M 68,28 L 68,58 L 78,48 L 78,38 Z"
          fill={thirdPillarColor}
          fillRule="evenodd"
        />
      </g>

      {/* ─── LOGO TEXT (PRIME PROPERTY - LUXURY GEOMETRIC TYPOGRAPHY) ─── */}
      {showText && (
        <g transform="translate(135, 0)">
          {/* "PRIME" - Centered wide-spaced text */}
          <text
            x="95"
            y="48"
            fill={textColor}
            textAnchor="middle"
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: '34px',
              fontWeight: 800,
              letterSpacing: '6px',
            }}
          >
            {BRAND_NAME}
          </text>
          
          {/* Gold Bounding Line Left */}
          <line
            x1="5"
            y1="71"
            x2="40"
            y2="71"
            stroke={accentColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* "PROPERTY" - Centered under PRIME */}
          <text
            x="95"
            y="75"
            fill={accentColor}
            textAnchor="middle"
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '5px',
            }}
          >
            {BRAND_SUB_NAME}
          </text>

          {/* Gold Bounding Line Right */}
          <line
            x1="150"
            y1="71"
            x2="185"
            y2="71"
            stroke={accentColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}
