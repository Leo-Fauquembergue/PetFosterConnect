import { forwardRef, useId, useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";

type InputPasswordProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const [show, setShow] = useState(false);

    // Génération d'ID unique pour l'accessibilité
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col gap-1 w-full relative">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 font-openSans">
          {label}
        </label>

        <div className="relative w-full">
          <input
            id={inputId}
            ref={ref}
            type={show ? "text" : "password"}
            className={`
              w-full px-4 py-2 pr-12 border rounded-lg outline-none transition-all
              font-openSans text-gray-800
              ${
                error
                  ? "border-error focus:ring-2 focus:ring-error/20"
                  : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
              }
              ${className}
            `}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-controls={inputId}
          >
            {show ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
          </button>
        </div>

        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    );
  }
);

InputPassword.displayName = "InputPassword";
export default InputPassword;
