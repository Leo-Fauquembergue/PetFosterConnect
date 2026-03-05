import { Menu } from "lucide-react";

interface BurgerMenuProps {
  onOpen: () => void;
}

export default function BurgerMenu({ onOpen }: BurgerMenuProps) {
  return (
    <button
      type="button"
      className="md:hidden p-4 absolute top-2 left-2 z-50 text-gray-800"
      onClick={onOpen}
      aria-label="Ouvrir le menu"
    >
      <Menu className="w-8 h-8" />
    </button>
  );
}
