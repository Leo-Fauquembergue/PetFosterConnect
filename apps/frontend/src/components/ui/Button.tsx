import React from "react";

// On étend les attributs natifs d'un bouton HTML
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "", // On récupère une potentielle className passée depuis le parent
  ...props // ...props contient type, onClick, disabled, etc.
}: ButtonProps) {
  // J'ai ajouté "disabled:opacity-50 disabled:cursor-not-allowed" pour un meilleur rendu visuel quand le bouton charge
  const baseStyles =
    "px-6 py-2 rounded-lg font-semibold transition duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white hover:bg-orange-600",
    secondary: "bg-secondary text-white hover:bg-green-800",
    outline: "border-2 border-primary text-primary hover:bg-orange-50",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : "w-auto"} ${className}`}
      {...props} // On injecte toutes les props natives ici (y compris le fameux disabled !)
    >
      {children}
    </button>
  );
}
