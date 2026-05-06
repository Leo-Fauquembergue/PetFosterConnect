import { ChevronRight } from "lucide-react";

interface BurgerMenuProps {
  onOpen: () => void;
}

export default function BurgerMenu({ onOpen }: BurgerMenuProps) {
  return (
    <button
      type="button"
      className="md:hidden p-2 absolute top-3 left-2 z-50 bg-white shadow-md border border-gray-100 rounded-full text-primary hover:text-secondary transition-all active:scale-95"
      onClick={onOpen}
      aria-label="Ouvrir le menu"
    >
      <ChevronRight className="w-6 h-6" />
    </button>
  );
}
