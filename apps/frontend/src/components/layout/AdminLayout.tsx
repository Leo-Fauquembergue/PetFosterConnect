import { Home, LayoutDashboard, PawPrint, Users, X } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import logo from "../../assets/Logo.png";
import { useDisclosure } from "../../hooks/useDisclosure";
import BurgerMenu from "../ui/BurgerMenu";

export default function AdminLayout() {
  const { isOpen, open, close } = useDisclosure();

  // Style des liens de navigation
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive
        ? "bg-primary text-white shadow-md font-semibold"
        : "text-gray-600 hover:bg-primary/10 hover:text-primary"
    }`;

  // SIDEBAR
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* En-tête */}
      <div className="p-6 flex items-center gap-2 border-b border-gray-100">
        <img src={logo} alt="Pet Foster Connect Logo" className="w-8 h-8 object-contain" />
        <span className="font-montserrat font-bold text-lg text-secondary">Administration</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavLink to="/admin" end className={getLinkClass} onClick={close}>
          <LayoutDashboard size={20} />
          <span>Tableau de bord</span>
        </NavLink>

        <NavLink to="/admin/utilisateurs" className={getLinkClass} onClick={close}>
          <Users size={20} />
          <span>Utilisateurs</span>
        </NavLink>

        <NavLink to="/admin/animaux" className={getLinkClass} onClick={close}>
          <PawPrint size={20} />
          <span>Animaux</span>
        </NavLink>
      </nav>

      {/* Pied de page */}
      <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50/50">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-500 hover:text-secondary transition rounded-md hover:bg-secondary/10"
          onClick={close}
        >
          <Home size={18} />
          <span>Retour au site</span>
        </NavLink>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-openSans overflow-hidden relative">
      {/* Burger menu (mobile only) */}
      <BurgerMenu onOpen={open} />

      {/* SIDEBAR RESPONSIVE */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
          flex flex-col shadow-sm
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0
        `}
      >
        {/* Bouton Fermer (mobile only) */}
        <button
          type="button"
          onClick={close}
          className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
          aria-label="Fermer le menu"
        >
          <X size={28} />
        </button>

        <SidebarContent />
      </aside>

      {/* Overlay (mobile only) */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/40 z-40 md:hidden w-full h-full border-none cursor-default backdrop-blur-sm transition-opacity"
          onClick={close}
          aria-label="Fermer le menu"
        />
      )}

      {/* ZONE PRINCIPALE */}
      <main className="flex-1 overflow-auto p-4 md:p-8 pt-16 md:pt-8 relative">
        <Outlet />
      </main>
    </div>
  );
}
