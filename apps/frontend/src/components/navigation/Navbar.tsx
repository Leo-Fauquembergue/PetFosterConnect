import { UserRole } from "@projet/shared-types";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useDisclosure } from "../../hooks/useDisclosure";

const Navbar = () => {
  const { isLoggedIn, logout, user } = useAuth();
  const { isOpen, toggle, close } = useDisclosure();

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/animaux", label: "Animaux" },
    { to: "/refuges", label: "Refuges" },
  ];

  if (isLoggedIn && user) {
    links.push({ to: `/utilisateur/${user.id}/profil`, label: "Profil" });
  }

  if (isLoggedIn && user?.role === UserRole.admin) {
    links.push({ to: "/admin", label: "Admin" });
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition duration-200 ${
      isActive ? "text-primary md:underline" : "text-white hover:text-primary/80"
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
      isActive
        ? "bg-primary/20 text-primary border-l-4 border-primary"
        : "text-white hover:bg-white/5"
    }`;

  const handleLogout = async () => {
    await logout();
    close();
  };

  return (
    <nav className="relative w-full">
      <div className="flex items-center w-full">
        <ul className="hidden md:flex gap-8 m-0 p-0 list-none justify-center flex-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden md:block ml-4">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-white hover:text-primary transition duration-200"
            >
              Déconnexion
            </button>
          ) : (
            <NavLink
              to="/connexion"
              className="text-sm font-medium text-white hover:text-primary transition duration-200"
            >
              Connexion
            </NavLink>
          )}
        </div>

        {/* Bouton Burger */}
        <button
          type="button"
          onClick={toggle}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white transition hover:bg-white/20 ml-auto focus:outline-none"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <>
          {/* Overlay pour fermer en cliquant à côté */}
          <button
            type="button"
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60] md:hidden w-full h-full border-none cursor-default"
            onClick={close}
            aria-label="Fermer le menu"
          />

          <div className="absolute top-[calc(100%+1rem)] right-0 w-64 bg-secondary/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 z-[70] md:hidden overflow-hidden transform origin-top-right transition-all duration-200 ease-out py-2 px-2">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={close} className={mobileLinkClass}>
                  {link.label}
                </NavLink>
              ))}

              <div className="my-2 border-t border-white/10" />

              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-error hover:bg-error/10 transition-all duration-200 w-full text-left"
                >
                  <LogOut size={20} />
                  Déconnexion
                </button>
              ) : (
                <NavLink
                  to="/connexion"
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-primary hover:bg-primary/10 transition-all duration-200"
                >
                  <LogIn size={20} />
                  Connexion / Inscription
                </NavLink>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
