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
  const width = showText ? (height * 3.2) : height;
  const textColor = light ? '#1A1A1A' : '#FFFFFF'; // Dynamic text color matching light/dark modes
  const accentColor = '#C9A961'; // Gold Accent
  const redColor = '#B33A3A'; // Red Accent
  const thirdPillarColor = light ? '#1A1A1A' : '#FFFFFF'; // Symmetrical to textColor

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
      {/* ─── LOGO MARK (THREE PILLARS EMBLEM) ─── */}
      <g transform="translate(10, 5)">
        {/* Pillar 1: Left Skewed (Gold) */}
        <path
          d="M 12,74 L 32,22 L 44,22 L 24,74 Z"
          fill={accentColor}
        />
        
        {/* Pillar 2: Center Vertical (Red) */}
        <path
          d="M 49,80 L 49,14 L 60,14 L 60,80 Z"
          fill={redColor}
        />

        {/* Pillar 3: Right Skewed (Contrast Light/Dark) */}
        <path
          d="M 85,74 L 65,22 L 53,22 L 73,74 Z"
          fill={thirdPillarColor}
        />
      </g>

      {/* ─── LOGO TEXT (PRIME PROPERTY) ─── */}
      {showText && (
        <g transform="translate(115, 0)">
          {/* "PRIME" */}
          <text
            x="0"
            y="48"
            fill={textColor}
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '6px',
            }}
          >
            {BRAND_NAME}
          </text>
          
          {/* Gold Bounding Line Left */}
          <line
            x1="0"
            y1="71"
            x2="24"
            y2="71"
            stroke={accentColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* "PROPERTY" */}
          <text
            x="32"
            y="76"
            fill={accentColor}
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '5px',
            }}
          >
            {BRAND_SUB_NAME}
          </text>

          {/* Gold Bounding Line Right */}
          <line
            x1="130"
            y1="71"
            x2="154"
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
