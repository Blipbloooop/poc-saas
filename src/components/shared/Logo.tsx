import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "navy" | "white";
  iconSize?: number;
  textSize?: number;
  iconOnly?: boolean;
  className?: string;
}

export function Logo({ variant = "navy", iconSize = 30, textSize = 20, iconOnly = false, className }: LogoProps) {
  const icon = variant === "white" ? "/brand/navibat-mark-white.svg" : "/brand/navibat-mark.svg";
  const naviColor = variant === "white" ? "#ffffff" : "#1e2a5a";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src={icon}
        alt="NaviBat"
        width={iconSize}
        height={Math.round(iconSize * (200 / 210))}
      />
      {!iconOnly && (
        <span
          className="font-wordmark font-black"
          style={{ fontSize: textSize, letterSpacing: "-0.3px" }}
        >
          <span style={{ color: naviColor }}>Navi</span>
          <span style={{ color: "#f5821f" }}>Bat</span>
        </span>
      )}
    </span>
  );
}

export default Logo;
