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
        {/* Gold Pentagon House Outline */}
        <polygon
          points="40,5 75,28 75,78 5,78 5,28"
          stroke={accentColor}
          strokeWidth="3.5"
          strokeLinejoin="round"
          fill="rgba(201, 169, 97, 0.03)"
        />
        {/* Inner Central Pillar */}
        <path
          d="M 40,78 L 40,30"
          stroke={accentColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Inner Chevron 1 (Upper) */}
        <path
          d="M 22,50 L 40,32 L 58,50"
          stroke={accentColor}
          strokeWidth="3.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
        {/* Inner Chevron 2 (Lower) */}
        <path
          d="M 22,65 L 40,47 L 58,65"
          stroke={accentColor}
          strokeWidth="3.5"
          strokeLinejoin="round"
          strokeLinecap="round"
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
            {BRAND_NAME}
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
            {BRAND_SUB_NAME}
          </text>
        </g>
      )}
    </svg>
  );
}
