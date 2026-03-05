import { UserRole } from "@projet/shared-types"; // Import de l'Enum
import { Home, LogOut, PawPrint, UserCircle, X } from "lucide-react";
import { CiFolderOn } from "react-icons/ci";
import { LuPlus } from "react-icons/lu";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useDisclosure } from "../../hooks/useDisclosure"; // Import du hook
import BurgerMenu from "../ui/BurgerMenu";

export default function UserSidebarLayout() {
  const { user, logout } = useAuth();
  // Remplacement du useState
  const { isOpen, open, close } = useDisclosure();

  return (
    <div className="flex h-screen relative">
      {/* Burger menu (mobile only) */}
      <BurgerMenu onOpen={open} /> {/* Utilisation de open */}
      {/* Sidebar responsive */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
          flex flex-col justify-between h-screen
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0
        `}
      >
        {/* Bouton fermer (mobile only) */}
        <button
          type="button"
          className="md:hidden absolute top-4 right-4"
          onClick={close}
          aria-label="Fermer le menu"
        >
          <X className="w-7 h-7 text-gray-700" />
        </button>

        <div>
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold font-montserrat text-primary">Mon espace</h2>
          </div>

          <nav className="p-4 space-y-2">
            {/* Profil */}
            <NavLink
              to={`/utilisateur/${user?.id}/profil`}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg transition 
                ${isActive ? "bg-[#F28C28] text-white" : "text-gray-700 hover:bg-[#F28C28]/20"}`
              }
              onClick={close}
            >
              <UserCircle className="w-5 h-5" />
              Mon Profil
            </NavLink>

            {/* Refuge : Mes Animaux + sous-menu */}
            {user?.role === UserRole.shelter && ( // Utilisation de l'Enum
              <div className="space-y-1">
                <NavLink
                  to={`/utilisateur/${user?.id}/animaux`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg transition 
                      ${
                        isActive ? "bg-[#F28C28] text-white" : "text-gray-700 hover:bg-[#F28C28]/20"
                      }`
                  }
                  onClick={close}
                >
                  <PawPrint className="w-5 h-5" />
                  Mes Animaux
                </NavLink>

                <div className="ml-8">
                  <NavLink
                    to={`/utilisateur/${user?.id}/profil/animaux/creer`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg transition 
                        ${
                          isActive
                            ? "bg-[#F28C28] text-white"
                            : "text-gray-700 hover:bg-[#F28C28]/20"
                        }`
                    }
                    onClick={close}
                  >
                    <LuPlus className="w-5 h-5" />
                    Ajouter un animal
                  </NavLink>
                </div>

                <NavLink
                  to={`/utilisateur/${user?.id}/demandes-recues`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg transition 
                      ${
                        isActive ? "bg-[#F28C28] text-white" : "text-gray-700 hover:bg-[#F28C28]/20"
                      }`
                  }
                  onClick={close}
                >
                  <CiFolderOn className="w-5 h-5" />
                  Demandes reçues
                </NavLink>
              </div>
            )}

            {/* Particulier : Mes Favoris */}
            {user?.role === UserRole.individual && ( // Utilisation de l'Enum
              <NavLink
                to={`/utilisateur/${user?.id}/favoris`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition 
                ${isActive ? "bg-[#F28C28] text-white" : "text-gray-700 hover:bg-[#F28C28]/20"}`
                }
                onClick={close}
              >
                <PawPrint className="w-5 h-5" />
                Mes Favoris
              </NavLink>
            )}

            {/* Particulier : Mes Demandes */}
            {user?.role === UserRole.individual && ( // Utilisation de l'Enum
              <NavLink
                to={`/utilisateur/${user?.id}/demandes`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition 
                    ${isActive ? "bg-[#F28C28] text-white" : "text-gray-700 hover:bg-[#F28C28]/20"}`
                }
                onClick={close}
              >
                <CiFolderOn className="w-5 h-5" />
                Mes Demandes
              </NavLink>
            )}
          </nav>
        </div>

        {/* Pied de sidebar */}
        <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50/50">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition 
                ${isActive ? "bg-[#F28C28] text-white" : "text-gray-700 hover:bg-[#F28C28]/20"}`
            }
            onClick={close}
          >
            <Home size={18} />
            <span>Retour au site</span>
          </NavLink>

          <button
            type="button"
            onClick={() => {
              logout();
              close();
            }}
            className="flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-[#F28C28]/20 w-full rounded-lg transition font-medium"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      {/* Overlay (mobile only) */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/40 z-40 md:hidden w-full h-full border-none cursor-default"
          onClick={close}
          aria-label="Fermer le menu"
        />
      )}
      {/* Contenu principal */}
      <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
