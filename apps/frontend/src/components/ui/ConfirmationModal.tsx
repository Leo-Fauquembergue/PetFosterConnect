import { AlertTriangle, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: "danger" | "warning" | "info";
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = "danger",
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop rendu avec un bouton html sémantique (résout l'erreur Biome) */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity w-full h-full border-none cursor-default"
        onClick={onClose}
        aria-label="Fermer la modale"
      />

      {/* Contenu de la modale */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
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
            className="text-gray-400 hover:text-gray-600 transition"
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
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white font-bold rounded-lg shadow-sm transition ${
              variant === "danger" ? "bg-error hover:bg-error/90" : "bg-primary hover:bg-primary/90"
            }`}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
