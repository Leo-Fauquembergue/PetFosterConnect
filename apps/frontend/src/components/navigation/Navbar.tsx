import { UserRole } from "@projet/shared-types";
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
    `text-sm font-medium text-white transition hover:underline ${isActive ? "underline" : ""}`;

  const handleLogout = async () => {
    await logout();
    close();
  };

  return (
    <nav className="relative w-full">
      <div className="flex items-center w-full">
        <ul className="hidden md:flex gap-6 m-0 p-0 list-none justify-center flex-1">
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
            <NavLink
              onClick={handleLogout}
              to="/"
              className="text-sm font-medium text-white hover:underline"
            >
              Déconnexion
            </NavLink>
          ) : (
            <NavLink to="/connexion" className="text-sm font-medium text-white hover:underline">
              Connexion / Inscription
            </NavLink>
          )}
        </div>

        <button
          type="button"
          onClick={toggle}
          className="md:hidden text-white text-2xl ml-auto p-2"
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-secondary z-50 shadow-lg md:hidden">
          <div className="flex flex-col gap-4 p-4">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={close} className={linkClass}>
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
                onClick={close}
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
