import { forwardRef, useId } from "react";

type RadioProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const radioId = id || generatedId;

    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            id={radioId}
            ref={ref}
            className={`w-4 h-4 text-primary focus:ring-primary border-gray-300 ${className}`}
            {...props}
          />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </label>
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    );
  }
);

Radio.displayName = "Radio";
export default Radio;