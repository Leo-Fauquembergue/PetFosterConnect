import { forwardRef, useId } from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = "", id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="flex flex-col gap-1 w-full">
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-gray-700 font-openSans mb-1"
        >
          {label}
        </label>
        <select
          id={selectId}
          ref={ref}
          className={`
            w-full px-4 py-2 border rounded-lg outline-none transition-all font-openSans bg-white text-gray-800
            ${
              error
                ? "border-error focus:ring-2 focus:ring-error/20"
                : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            }
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;