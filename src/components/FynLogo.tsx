import logoLight from "@/assets/fynhelp-logo.png";
import logoDarkAsset from "@/assets/fynhelp-logo-dark.png.asset.json";

interface FynLogoProps {
  variant?: "dark" | "light";
  showTagline?: boolean;
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const FynLogo = ({ variant = "dark", showTagline = true, className = "", iconOnly = false, size = "md" }: FynLogoProps) => {
  // Height of the rendered logo image. Tagline is baked into the artwork,
  // so when showTagline is false we crop slightly and use a smaller box.
  const height = iconOnly
    ? (size === "sm" ? 32 : size === "lg" ? 48 : 40)
    : showTagline
      ? (size === "sm" ? 40 : size === "lg" ? 72 : 56)
      : (size === "sm" ? 28 : size === "lg" ? 48 : 36);

  const src = variant === "light" ? logoLight : logoDarkAsset.url;

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src={src}
        alt="FynHelp, Find Your Numbers"
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
