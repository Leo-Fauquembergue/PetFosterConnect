import { Outlet } from "react-router-dom";
import Footer from "../navigation/Footer.tsx";
import Header from "../navigation/Header.tsx";

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-grow">
        {/* Outlet est l'endroit où s'affichent les pages enfants (Home, Login, etc.) */}
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}
