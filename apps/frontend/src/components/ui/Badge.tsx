type BadgeProps = {
  label: string;
  // ⚡ AJOUT : On autorise 'info' et 'warning' dans les types
  variant?: "default" | "success" | "error" | "neutral" | "info" | "warning";
  className?: string;
};

export default function Badge({ label, variant = "neutral", className = "" }: BadgeProps) {
  const styles = {
    default: "bg-gray-200 text-gray-800 px-3",
    success: "bg-success text-white font-bold px-4",
    error: "bg-error text-white font-bold px-4",
    neutral: "bg-gray-100 text-gray-800 px-3",
    // ⚡ AJOUT : On définit les styles visuels pour ces nouvelles variantes
    info: "bg-info text-white font-bold px-4",
    warning: "bg-warning text-white font-bold px-4",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full text-sm min-h-[1.75rem] leading-none ${styles[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
