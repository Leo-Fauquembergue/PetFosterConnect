import { forwardRef, useId } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    // Si l'utilisateur fournit un ID, on l'utilise, sinon on en génère un
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col gap-1 w-full">
        {/* On lie le label à l'input via htmlFor */}
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 font-openSans">
          {label}
        </label>

        <input
          id={inputId}
          ref={ref}
          className={`
            w-full px-4 py-2 border rounded-lg outline-none transition-all
            font-openSans text-text-main
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

Input.displayName = "Input";
export default Input;
