import React from "react";

// On étend les attributs natifs d'un bouton HTML
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "outline-white"
    | "neutral"
    | "info"
    | "danger"
    | "warning"
    | "ghost";
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  // On revient à un style plus proche du standard du projet : px-4 par défaut au lieu de px-6
  // Et font-medium au lieu de font-semibold pour être moins agressif visuellement
  const baseStyles =
    "px-4 py-2 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-sm",
    secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-sm",
    outline: "border-2 border-primary text-primary hover:bg-primary/10",
    "outline-white": "border-2 border-white text-white hover:bg-white hover:text-secondary",
    neutral: "bg-gray-600 text-white hover:bg-gray-700",
    info: "bg-info text-white hover:bg-info/90",
    danger: "bg-error text-white hover:bg-error/90",
    warning: "bg-warning text-white hover:bg-warning/90",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : "w-auto"} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
