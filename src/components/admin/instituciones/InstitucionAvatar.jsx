"use client";

import { Building2 } from "lucide-react";

export default function InstitucionAvatar({
  foto = null,
  nombre = "",
  size = "md",
  className = "",
}) {
  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-9 h-9 rounded-xl",
    lg: "w-12 h-12 rounded-xl",
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const iconSize = iconSizes[size] || iconSizes.md;

  if (foto) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={foto}
        alt={nombre || "Institución"}
        className={`${selectedSize} object-cover border border-border-subtle shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${selectedSize} bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 font-bold ${className}`}
      aria-label={nombre || "Institución"}
    >
      <Building2 size={iconSize} />
    </div>
  );
}
