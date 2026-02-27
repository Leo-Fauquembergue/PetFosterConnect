import { Outlet } from "react-router-dom";
import Header from "../navigation/Header.tsx";
import Footer from "../navigation/Footer.tsx";

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