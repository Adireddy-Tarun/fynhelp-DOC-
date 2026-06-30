import logoFull from "@/assets/fynhelp-logo-full.png";
import logoIcon from "@/assets/fynhelp-icon.png";

interface FynLogoProps {
  variant?: "dark" | "light";
  showTagline?: boolean;
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const FynLogo = ({ className = "", iconOnly = false, size = "md" }: FynLogoProps) => {
  const heightPx = size === "sm" ? 28 : size === "lg" ? 44 : 36;

  if (iconOnly) {
    return (
      <img
        src={logoIcon}
        alt="FynHelp"
        className={className}
        style={{ height: heightPx, width: heightPx, objectFit: "contain", display: "block" }}
      />
    );
  }

  return (
    <img
      src={logoFull}
      alt="FynHelp"
      className={className}
      style={{ height: heightPx, width: "auto", objectFit: "contain", display: "block" }}
    />
  );
};

export default FynLogo;
