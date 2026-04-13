interface FynLogoProps {
  variant?: "dark" | "light";
  showTagline?: boolean;
  className?: string;
}

const FynLogo = ({ variant = "dark", showTagline = true, className = "" }: FynLogoProps) => {
  const inkColor = variant === "dark" ? "#1A1008" : "#F4EDDA";
  const redColor = "#C41E1E";
  const goldColor = "#8B6914";
  const beigeColor = variant === "dark" ? "#F4EDDA" : "#F4EDDA";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon Mark */}
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="42" height="42" rx="4" fill={beigeColor} stroke={inkColor} strokeWidth="1.5" />
        {/* Bar chart bars suggesting F shape */}
        <rect x="10" y="28" width="14" height="4" rx="1" fill={inkColor} />
        <rect x="10" y="22" width="20" height="4" rx="1" fill={inkColor} />
        <rect x="10" y="16" width="10" height="4" rx="1" fill={inkColor} />
        <rect x="10" y="10" width="16" height="4" rx="1" fill={inkColor} />
        {/* Red trend line */}
        <line x1="12" y1="34" x2="34" y2="10" stroke={redColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="34" cy="10" r="3" fill={redColor} />
      </svg>
      {/* Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span style={{ color: inkColor, fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 26 }}>Fyn</span>
          <span style={{ color: redColor, fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 26 }}>Help</span>
        </div>
        {showTagline && (
          <span style={{ color: goldColor, fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const }}>
            Find Your Numbers
          </span>
        )}
      </div>
    </div>
  );
};

export default FynLogo;
