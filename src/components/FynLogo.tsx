interface FynLogoProps {
  variant?: "dark" | "light";
  showTagline?: boolean;
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const FynLogo = ({ variant = "dark", showTagline = true, className = "", iconOnly = false, size = "md" }: FynLogoProps) => {
  const isDark = variant === "light"; // light = on dark bg
  const inkColor = isDark ? "#FFFFFF" : "#1A1008";
  const redColor = "#C41E1E";
  const goldColor = "#8B6914";

  const iconSize = size === "sm" ? 32 : size === "lg" ? 48 : 40;
  const fontSize = size === "sm" ? 20 : size === "lg" ? 28 : 24;
  const tagSize = size === "sm" ? 7 : size === "lg" ? 10 : 9;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="46" height="46" rx="4" fill={isDark ? "#1A1008" : "#F4EDDA"} stroke={inkColor} strokeWidth="2" />
        {/* Bar chart bars — ascending staircase suggesting "F" */}
        <rect x="8" y="32" width="12" height="4" rx="1" fill={inkColor} />
        <rect x="8" y="25" width="20" height="4" rx="1" fill={inkColor} />
        <rect x="8" y="18" width="28" height="4" rx="1" fill={inkColor} />
        {/* Red trend line from bottom-left to top-right */}
        <line x1="14" y1="36" x2="36" y2="12" stroke={redColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="36" cy="12" r="4" fill={redColor} />
      </svg>

      {!iconOnly && (
        <div className="flex flex-col">
          <div className="flex items-baseline" style={{ lineHeight: 1 }}>
            <span style={{ color: inkColor, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize }}
            >Fyn</span>
            <span style={{ color: redColor, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize }}
            >Help</span>
          </div>
          {showTagline && (
            <span style={{
              color: goldColor,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: tagSize,
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              marginTop: 2,
            }}>
              Find Your Numbers
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FynLogo;
