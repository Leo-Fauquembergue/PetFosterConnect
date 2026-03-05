import { forwardRef, useId } from "react";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            className={`w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded ${className}`}
            {...props}
          />
          <span className="text-sm text-gray-700">{label}</span>
        </label>
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
