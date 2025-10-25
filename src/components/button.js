import React from "react";
import clsx from "clsx";

export function Button({ children, className, variant = "solid", size = "md", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200";

  const variants = {
    solid: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "text-blue-600 hover:bg-blue-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
