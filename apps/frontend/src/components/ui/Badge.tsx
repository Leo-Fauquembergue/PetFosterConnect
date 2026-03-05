type BadgeProps = {
  label: string;
  // ⚡ AJOUT : On autorise 'info' et 'warning' dans les types
  variant?: "default" | "success" | "error" | "neutral" | "info" | "warning";
  className?: string;
};

export default function Badge({ label, variant = "neutral", className = "" }: BadgeProps) {
  const styles = {
    default: "bg-gray-200 text-gray-800",
    success: "bg-success text-white font-bold px-4 py-1",
    error: "bg-error text-white font-bold px-4 py-1",
    neutral: "bg-gray-100 text-gray-800 px-3 py-1",
    // ⚡ AJOUT : On définit les styles visuels pour ces nouvelles variantes
    info: "bg-blue-500 text-white font-bold px-4 py-1",
    warning: "bg-yellow-500 text-white font-bold px-4 py-1",
  };

  return <span className={`rounded-full text-sm ${styles[variant]} ${className}`}>{label}</span>;
}
