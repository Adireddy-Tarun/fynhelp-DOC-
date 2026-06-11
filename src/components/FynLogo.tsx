interface FynLogoProps {
  variant?: "dark" | "light";
  showTagline?: boolean;
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const INK = "#1A1008";
const RED = "#A93838";

const FynMark = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
    <rect x="1" y="1" width="22" height="22" rx="2" stroke={INK} strokeWidth="1.5" fill="none" />
    <line x1="4" y1="17" x2="10" y2="17" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <line x1="4" y1="13" x2="12" y2="13" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <line x1="4" y1="9" x2="8" y2="9" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="14" x2="18" y2="6" stroke={RED} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="18" cy="6" r="2" fill={RED} />
    <line x1="8" y1="21" x2="16" y2="21" stroke={RED} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FynLogo = ({ showTagline = false, className = "", iconOnly = false, size = "md" }: FynLogoProps) => {
  const iconSize = size === "sm" ? 20 : size === "lg" ? 32 : 24;
  const fontSize = size === "sm" ? 15 : size === "lg" ? 22 : 18;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <FynMark size={iconSize} />
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: INK,
            }}
          >
            Fyn<span style={{ color: RED }}>Help</span>
          </span>
          {showTagline && (
            <span
              style={{
                fontSize: 9,
                letterSpacing: "0.18em",
                color: "#8B6914",
                marginTop: 4,
                textTransform: "uppercase",
              }}
            >
              Find your numbers
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FynLogo;
