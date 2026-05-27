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
  const width = showText ? (height * 3.4) : height;
  const textColor = light ? '#FFFFFF' : '#1A1A1A'; // Dynamic text color matching light/dark modes
  const accentColor = '#C9A961'; // Gold Accent
  const redColor = '#B33A3A'; // Red Accent
  const thirdPillarColor = light ? '#FFFFFF' : '#1A1A1A'; // Symmetrical to textColor

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 340 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      aria-label="Prime Property Logo"
    >
      {/* ─── LOGO MARK (THREE PILLARS EMBLEM - PERFECTLY SYMMETRIC & CRITICAL GAPS) ─── */}
      <g transform="translate(15, 0)">
        {/* Pillar 1: Left Skewed (Gold) - Perfectly slanting / */}
        <path
          d="M 10,80 L 28,20 L 40,20 L 22,80 Z"
          fill={accentColor}
        />
        
        {/* Pillar 2: Center Vertical (Red) - Taller and perfectly centered */}
        <path
          d="M 45,90 L 45,10 L 55,10 L 55,90 Z"
          fill={redColor}
        />

        {/* Pillar 3: Right Skewed (Contrast Light/Dark) - Perfectly slanting \ */}
        <path
          d="M 90,80 L 72,20 L 60,20 L 78,80 Z"
          fill={thirdPillarColor}
        />
      </g>

      {/* ─── LOGO TEXT (PRIME PROPERTY - PERFECTLY ALIGNED & CENTERED) ─── */}
      {showText && (
        <g transform="translate(130, 0)">
          {/* "PRIME" - Centered text */}
          <text
            x="85"
            y="48"
            fill={textColor}
            textAnchor="middle"
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '5px',
            }}
          >
            {BRAND_NAME}
          </text>
          
          {/* Gold Bounding Line Left - Symmetric */}
          <line
            x1="5"
            y1="71"
            x2="35"
            y2="71"
            stroke={accentColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* "PROPERTY" - Centered under PRIME */}
          <text
            x="85"
            y="75"
            fill={accentColor}
            textAnchor="middle"
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '4px',
            }}
          >
            {BRAND_SUB_NAME}
          </text>

          {/* Gold Bounding Line Right - Symmetric */}
          <line
            x1="135"
            y1="71"
            x2="165"
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
