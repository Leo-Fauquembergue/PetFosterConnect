import logo from "../../assets/Logo.png";
import Navbar from "./Navbar";

const Header = () => {
  return (
    <header className="w-full bg-secondary">
      <div className="mx-0 flex w-full items-center justify-between px-6 py-3">
        {/* Logo + nom */}
        <div className="flex items-center gap-3 text-white font-semibold whitespace-nowrap">
          <img src={logo} alt="Pet Foster Connect" className="h-8 w-8" />
          <span className="text-lg">Pet Foster Connect</span>
        </div>

        <Navbar />
      </div>
    </header>
  );
};

export default Header;
