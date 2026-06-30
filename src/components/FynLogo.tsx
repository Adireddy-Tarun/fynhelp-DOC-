import logoRed from "@/assets/brand/fynhelp-logo-red.png.asset.json";
import logoCream from "@/assets/brand/fynhelp-logo-cream.png.asset.json";
import iconRed from "@/assets/brand/fynhelp-icon-red.png.asset.json";
import iconCream from "@/assets/brand/fynhelp-icon-cream.png.asset.json";

interface FynLogoProps {
  /** "dark" = red logo for light backgrounds (default). "light" = cream logo for dark backgrounds. */
  variant?: "dark" | "light";
  showTagline?: boolean;
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const FynLogo = ({ variant = "dark", className = "", iconOnly = false, size = "md" }: FynLogoProps) => {
  const heightPx = size === "sm" ? 28 : size === "lg" ? 44 : 36;
  const isLight = variant === "light";

  if (iconOnly) {
    const src = isLight ? iconCream.url : iconRed.url;
    return (
      <img
        src={src}
        alt="FynHelp"
        className={className}
        style={{ height: heightPx, width: heightPx, objectFit: "contain", display: "block" }}
      />
    );
  }

  const src = isLight ? logoCream.url : logoRed.url;
  return (
    <img
      src={src}
      alt="FynHelp"
      className={className}
      style={{ height: heightPx, width: "auto", objectFit: "contain", display: "block" }}
    />
  );
};

export default FynLogo;
