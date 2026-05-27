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
  const thirdPillarColor = '#1A1A1A'; // Constantly charcoal-black to match client logo on white background

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
        {/* White Backing Card with premium gold border to prevent dark overlaps */}
        <rect
          x="2"
          y="2"
          width="96"
          height="96"
          rx="18"
          fill="#FFFFFF"
          stroke="#C9A961"
          strokeWidth="3"
        />

        {/* Pillar 1: Left Wing / Arrowhead (Gold) */}
        <path
          d="M 42,82 L 42,20 L 32,30 L 12,50 L 32,44 L 32,92 Z"
          fill={accentColor}
        />
        
        {/* Pillar 2: Center Vertical Pillar (Red) - Diagonal cuts */}
        <path
          d="M 45,89 L 55,79 L 55,7 L 45,17 Z"
          fill={redColor}
        />

        {/* Pillar 3: Right Hollow Geometric "P" (Contrast Light/Dark) */}
        <path
          d="M 58,7 L 68,17 L 88,37 L 88,47 L 68,67 L 68,69 L 58,79 Z M 68,27 L 68,57 L 78,47 L 78,37 Z"
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
