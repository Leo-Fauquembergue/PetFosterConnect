import { forwardRef, useId } from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor={textareaId} className="text-sm font-medium text-gray-700 font-openSans">
          {label}
        </label>
        <textarea
          id={textareaId}
          ref={ref}
          className={`
            w-full px-4 py-2 border rounded-lg outline-none transition-all font-openSans text-gray-800 min-h-[120px] resize-y
            ${
              error
                ? "border-error focus:ring-2 focus:ring-error/20"
                : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            }
            ${className}
          `}
          {...props}
        />
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
