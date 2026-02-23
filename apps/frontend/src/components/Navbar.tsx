import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Navbar = () => {
  const { isLoggedIn, logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/animaux", label: "Animaux" },
    { to: "/refuges", label: "Refuges" },
  ];

  if (isLoggedIn && user) {
    links.push({ to: `/user/${user.id}/profil`, label: "Profil" });
  }

  if (isLoggedIn && user?.role === "admin") {
    links.push({ to: "/admin", label: "Admin" });
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium text-white transition hover:underline ${
      isActive ? "underline" : ""
    }`;

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <nav className="relative w-full">
      {/* ===== NAVBAR (HAUTEUR FIXE) ===== */}
      <div className="flex items-center w-full">
        {/* Liens desktop */}
        <ul className="hidden md:flex gap-6 m-0 p-0 list-none justify-center flex-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Auth desktop */}
        <div className="hidden md:block ml-4">
          {isLoggedIn ? (
            <NavLink
              onClick={handleLogout}
              to="/"
              className="text-sm font-medium text-white hover:underline"
            >
              Déconnexion
            </NavLink>
          ) : (
            <NavLink
              to="/connexion"
              className="text-sm font-medium text-white hover:underline"
            >
              Connexion / Inscription
            </NavLink>
          )}
        </div>

        {/* Burger mobile */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white text-2xl ml-auto"
        >
          ☰
        </button>
      </div>

      {/* ===== MENU MOBILE (OVERLAY) ===== */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-secondary z-50 shadow-lg md:hidden">
          <div className="flex flex-col gap-4 p-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={linkClass}
              >
                {link.label}
              </NavLink>
            ))}

            {isLoggedIn ? (
              <NavLink
                to="/"
                onClick={handleLogout}
                className="text-sm font-medium text-white hover:underline"
              >
                Déconnexion
              </NavLink>
            ) : (
              <NavLink
                to="/connexion"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-white hover:underline"
              >
                Connexion / Inscription
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
