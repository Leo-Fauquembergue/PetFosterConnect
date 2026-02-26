import { NavLink, Outlet } from "react-router-dom";
import { UserCircle, PawPrint, Home, LogOut } from "lucide-react";
import { CiFolderOn } from "react-icons/ci"; 
import { LuPlus } from "react-icons/lu";
import { useAuth } from "../../auth/AuthContext";
import BurgerMenu from "../ui/BurgerMenu";
import { useState } from "react";

export default function UserSidebarLayout() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen relative">

      {/* Burger menu (mobile only) */}
      <BurgerMenu onOpen={() => setIsOpen(true)} />

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
          className="md:hidden absolute top-4 right-4"
          onClick={() => setIsOpen(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
            className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div>
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold font-montserrat text-primary">
              Mon espace
            </h2>
          </div>

          <nav className="p-4 space-y-2">
            {/* Profil */}
            <NavLink
              to={`/utilisateur/${user?.id}/profil`}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg transition 
                ${isActive 
                    ? "bg-[#F28C28] text-white" 
                    : "text-gray-700 hover:bg-[#F28C28]/20"}`
              }
              onClick={() => setIsOpen(false)}
            >
              <UserCircle className="w-5 h-5" />
              Mon Profil
            </NavLink>
            

            {/* Refuge : Mes Animaux + sous-menu */}
            {user?.role === "shelter" && (
              <div className="space-y-1">
                <NavLink
                  to={`/utilisateur/${user?.id}/animaux`}
                  className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg transition 
                      ${isActive 
                          ? "bg-[#F28C28] text-white" 
                          : "text-gray-700 hover:bg-[#F28C28]/20"}`
                    }
                  onClick={() => setIsOpen(false)}
                >
                  <PawPrint className="w-5 h-5" />
                  Mes Animaux
                </NavLink>

                <div className="ml-8">
                  <NavLink
                    to={`/utilisateur/${user?.id}/profil/animaux/creer`}
                    className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-lg transition 
                        ${isActive 
                            ? "bg-[#F28C28] text-white" 
                            : "text-gray-700 hover:bg-[#F28C28]/20"}`
                      }
                    onClick={() => setIsOpen(false)}
                  >
                    <LuPlus className="w-5 h-5"/>
                    Ajouter un animal
                  </NavLink>
                </div>

                <NavLink
                  to={`/utilisateur/${user?.id}/demandes-recues`}
                  className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg transition 
                      ${isActive 
                        ? "bg-[#F28C28] text-white" 
                        : "text-gray-700 hover:bg-[#F28C28]/20"}`
                    }
                  onClick={() => setIsOpen(false)}
                >
                  <CiFolderOn className="w-5 h-5" /> 
                  Demandes reçues
                </NavLink>
              </div>
            )}

            {/* Particulier : Mes Favoris */}
            {user?.role === "individual" && (
            <NavLink
              to={`/utilisateur/${user?.id}/favoris`}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg transition 
                ${isActive 
                    ? "bg-[#F28C28] text-white" 
                    : "text-gray-700 hover:bg-[#F28C28]/20"}`
              }
              onClick={() => setIsOpen(false)}
            >
              <PawPrint className="w-5 h-5" />
              Mes Favoris
            </NavLink>
            )}
            
              {/* Particulier : Mes Demandes */}
            {user?.role === "individual" && (
              <NavLink
                to={`/utilisateur/${user?.id}/demandes`}
                className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg transition 
                    ${isActive 
                        ? "bg-[#F28C28] text-white" 
                        : "text-gray-700 hover:bg-[#F28C28]/20"}`
                  }
                onClick={() => setIsOpen(false)}
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
                ${isActive 
                    ? "bg-[#F28C28] text-white" 
                    : "text-gray-700 hover:bg-[#F28C28]/20"}`
              }
            onClick={() => setIsOpen(false)}
          >
            <Home size={18} />
            <span>Retour au site</span>
          </NavLink>

          <button
            type="button"
            onClick={() => {
              logout();
              setIsOpen(false);
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
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Contenu principal */}
      <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
