import { Home, LayoutDashboard, LogOut, Menu, PawPrint, Users, X } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import logo from "../../assets/Logo.png";
import { useDisclosure } from "../../hooks/useDisclosure"; // Import du hook

export default function AdminLayout() {
  // Remplacement du useState par le hook
  const { isOpen, open, close } = useDisclosure();

  // Style des liens de navigation
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive
        ? "bg-primary text-white shadow-md font-semibold"
        : "text-gray-600 hover:bg-orange-50 hover:text-primary"
    }`;

  // SIDEBAR
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* En-tête */}
      <div className="p-6 flex items-center gap-2 border-b border-gray-100">
        <img src={logo} alt="Pet Foster Connect Logo" className="w-8 h-8 object-contain" />
        <span className="font-montserrat font-bold text-lg text-secondary">Admin Panel</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavLink to="/admin" end className={getLinkClass} onClick={close}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
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
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-500 hover:text-secondary transition rounded-md hover:bg-gray-100"
          onClick={close}
        >
          <Home size={18} />
          <span>Retour au site</span>
        </NavLink>

        <button
          type="button"
          className="flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-red-50 w-full rounded-lg transition font-medium"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-openSans overflow-hidden">
      {/* SIDEBAR DESKTOP */}
      <aside className="w-64 border-r border-gray-200 hidden md:flex flex-col shadow-sm z-10">
        <SidebarContent />
      </aside>

      {/* SIDEBAR MOBILE */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity cursor-pointer"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Menu glissant */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={close}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition z-50"
          aria-label="Fermer le menu"
        >
          <X size={28} />
        </button>

        {/* Contenu du menu */}
        <div className="h-full pt-12">
          <SidebarContent />
        </div>
      </aside>

      {/* ZONE PRINCIPALE */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        {/* HEADER MOBILE */}
        <header className="md:hidden bg-white h-16 border-b flex items-center justify-between px-4 shadow-sm z-20 flex-shrink-0">
          {/* Logo + Titre */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-montserrat font-bold text-lg text-secondary">Admin Panel</span>
          </div>

          {/* Bouton Burger */}
          <button
            type="button"
            onClick={open} // Remplacement de setIsMobileMenuOpen(true)
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu size={28} />
          </button>
        </header>

        {/* CONTENU DE LA PAGE */}
        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
