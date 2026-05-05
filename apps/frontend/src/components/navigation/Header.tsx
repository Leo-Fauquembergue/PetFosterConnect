import logo from "../../assets/Logo.png";
import Navbar from "./Navbar";

const Header = () => {
  return (
    <header className="w-full bg-secondary">
      <div className="mx-0 flex w-full items-center justify-between px-6 py-3">
        {/* Logo + nom */}
        <div className="flex items-center gap-4 text-white font-bold whitespace-nowrap">
          <img src={logo} alt="Pet Foster Connect" className="h-10 w-10 md:h-12 md:w-12" />
          <span className="text-xl md:text-2xl font-montserrat tracking-tight">
            Pet Foster Connect
          </span>
        </div>

        <Navbar />
      </div>
    </header>
  );
};

export default Header;
