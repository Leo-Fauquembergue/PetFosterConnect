type CompatibilityBadgeProps = {
  label: string;
  isCompatible: boolean;
};

export default function CompatibilityBadge({ label, isCompatible }: CompatibilityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center px-4 min-h-[2.25rem] rounded-lg text-white text-sm font-medium shadow-sm leading-none
      ${isCompatible ? "bg-success" : "bg-error"}`}
    >
      {label}
    </span>
  );
}
