import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  variant?: "danger" | "warning" | "info";
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = "danger",
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop rendu avec un bouton html sémantique (résout l'erreur Biome) */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity w-full h-full border-none cursor-default rounded-none"
        onClick={onClose}
        aria-label="Fermer la modale"
      />

      {/* Contenu de la modale */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                variant === "danger" ? "bg-error/10 text-error" : "bg-primary/10 text-primary"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Footer (Boutons) */}
        <div className="bg-gray-50 p-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
