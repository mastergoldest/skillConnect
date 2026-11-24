
import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-24 w-24 text-3xl",
};

export default function Avatar({
  src,
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const showImage = Boolean(src) && !imageError;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 font-bold text-primary ${sizeClasses[size]} ${className}`}
      aria-label={`${name}'s profile picture`}
    >
      {showImage ? (
        <img
          src={src!}
          alt={`${name}'s profile`}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        initials || "?"
      )}
    </div>
  );
}
