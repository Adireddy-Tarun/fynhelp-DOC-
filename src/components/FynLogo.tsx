import logoAsset from "@/assets/fynhelp-wordmark-horizontal.png.asset.json";

interface FynLogoProps {
  variant?: "dark" | "light";
  showTagline?: boolean;
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const FynLogo = ({ variant = "dark", showTagline = true, className = "", iconOnly = false, size = "md" }: FynLogoProps) => {
  const height = iconOnly
    ? (size === "sm" ? 32 : size === "lg" ? 48 : 40)
    : showTagline
      ? (size === "sm" ? 40 : size === "lg" ? 72 : 56)
      : (size === "sm" ? 28 : size === "lg" ? 48 : 36);

  const src = logoAsset.url;
  void variant;

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src={src}
        alt="FynHelp"
        style={{
          height,
          width: "auto",
          objectFit: "contain",
          display: "block",
        }}
        draggable={false}
      />
    </div>
  );
};

export default FynLogo;
