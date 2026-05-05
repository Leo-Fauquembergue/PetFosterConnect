import { UserRole } from "@projet/shared-types";
import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuth } from "./auth/AuthContext.tsx";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./auth/ProtectedRoute.tsx";
// Layouts
import AdminLayout from "./components/layout/AdminLayout";
import PublicLayout from "./components/layout/PublicLayout";
import UserSidebarLayout from "./components/layout/UserSidebarLayout.tsx";
// Components
import ScrollToTop from "./components/ui/ScrollToTop";
// Pages
import About from "./pages/About";
import AnimalDetail from "./pages/AnimalDetail";
import AnimalList from "./pages/AnimalList";
import AuthPage from "./pages/AuthPage";
import AdminAnimals from "./pages/admin/AdminAnimals";
import AdminUsers from "./pages/admin/AdminUsers";
import DashboardPage from "./pages/admin/DashboardPage";
import Forbidden from "./pages/Forbidden";
import Home from "./pages/Home.tsx";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ApplicationsReceived from "./pages/profile/ApplicationsReceived.tsx";
import ApplicationsSent from "./pages/profile/ApplicationsSent.tsx";
import BookmarksPage from "./pages/profile/Bookmarks.tsx";
import AnimalForm from "./pages/profile/CreateEditAnimalPage.tsx";
import ShelterAnimalList from "./pages/profile/ShelterAnimalList";
import UserProfilePage from "./pages/profile/UserProfile";
import ShelterAnimalPage from "./pages/ShelterAnimal";
import ShelterDetailPage from "./pages/ShelterDetail";
import SheltersPage from "./pages/ShelterList";
import Unauthorized from "./pages/Unauthorized";

function App() {
  const { setUser, setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setIsLoggedIn(false);
    };

    const handleForbidden = () => {
      navigate("/interdit");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    window.addEventListener("auth:forbidden", handleForbidden);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
      window.removeEventListener("auth:forbidden", handleForbidden);
    };
  }, [navigate, setUser, setIsLoggedIn]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ZONE PUBLIQUE */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/mentions-legales" element={<Legal />} />
          <Route path="/confidentialite" element={<PrivacyPolicy />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/connexion" element={<AuthPage />} />
          <Route path="/inscription" element={<AuthPage />} />
          <Route path="/animaux" element={<AnimalList />} />
          <Route path="/animaux/:id" element={<AnimalDetail />} />
          <Route path="/refuges" element={<SheltersPage />} />
          <Route path="/refuges/:id" element={<ShelterDetailPage />} />
          <Route path="/refuges/:id/animaux" element={<ShelterAnimalPage />} />

          {/* ESPACE UTILISATEUR */}
          <Route
            element={
              <ProtectedRoute>
                <UserSidebarLayout />
              </ProtectedRoute>
            }
          >
            {/* Pages communes */}
            <Route path="/utilisateur/:id/profil" element={<UserProfilePage />} />

            {/* Pages réservées aux REFUGES */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.shelter]} />}>
              <Route path="/utilisateur/:id/animaux" element={<ShelterAnimalList />} />
              <Route path="/utilisateur/:id/profil/animaux/creer" element={<AnimalForm />} />
              <Route path="/utilisateur/:id/demandes-recues" element={<ApplicationsReceived />} />
            </Route>

            {/* Pages réservées aux PARTICULIERS */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.individual]} />}>
              <Route path="/utilisateur/:id/favoris" element={<BookmarksPage />} />
              <Route path="/utilisateur/:id/demandes" element={<ApplicationsSent />} />
            </Route>

            {/* Visualisation animal en contexte utilisateur */}
            <Route path="/utilisateur/:userId/animaux/:id" element={<AnimalDetail />} />
          </Route>

          {/* Route 404 & Erreurs */}
          <Route path="*" element={<NotFound />} />
          <Route path="/non-autorise" element={<Unauthorized />} />
          <Route path="/interdit" element={<Forbidden />} />
        </Route>

        {/* ZONE ADMIN */}
        {/* Sécurisation globale du layout Admin avec le bon nom de prop et l'Enum */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[UserRole.admin]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="utilisateurs" element={<AdminUsers />} />
          <Route path="animaux" element={<AdminAnimals />} />
        </Route>
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
