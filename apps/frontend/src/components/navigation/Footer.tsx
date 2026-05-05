import { NavLink } from "react-router-dom";
import logo from "../../assets/Logo.png";

const Footer = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition duration-200 ${
      isActive
        ? "text-primary underline decoration-2 underline-offset-4"
        : "text-white hover:text-primary/80"
    }`;

  return (
    <footer className="w-full bg-secondary border-t border-white/10">
      <div
        className="
        max-w-7xl mx-auto px-6 py-6
        flex flex-col items-center gap-6
        md:flex-row md:justify-between md:gap-0
      "
      >
        {/* Logo + nom */}
        <div className="flex items-center gap-4 text-white font-bold whitespace-nowrap">
          <img src={logo} alt="Pet Foster Connect" className="h-10 w-10 md:h-12 md:w-12" />
          <span className="text-xl md:text-2xl font-montserrat tracking-tight">
            Pet Foster Connect
          </span>
        </div>

        {/* Liens centraux */}
        <nav
          className="
          flex flex-col items-center gap-4
          md:flex-row md:gap-8
        "
        >
          <NavLink to="/mentions-legales" className={linkClass}>
            Mentions légales
          </NavLink>
          <NavLink to="/confidentialite" className={linkClass}>
            Confidentialité
          </NavLink>
          <NavLink to="/a-propos" className={linkClass}>
            À propos
          </NavLink>
        </nav>

        {/* Bouton contact */}
        <NavLink to="/contact" className={linkClass}>
          Nous contacter
        </NavLink>
      </div>
    </footer>
  );
};

export default Footer;
