import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./auth/AuthContext.tsx";
import "react-toastify/dist/ReactToastify.css";
// Layouts
import AdminLayout from "./components/layout/AdminLayout";
import PublicLayout from "./components/layout/PublicLayout";
import UserSidebarLayout from "./components/layout/UserSidebarLayout.tsx";

//Pages
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
import ProtectedRoute from "./pages/ProtectedRoute";
import AnimalForm from "./pages/profile/AnimalForm";
import ShelterAnimalList from "./pages/profile/ShelterAnimalList";
import UserProfilePage from "./pages/profile/UserProfile";
import ShelterAnimalPage from "./pages/ShelterAnimal";
import ShelterDetailPage from "./pages/ShelterDetail";
import SheltersPage from "./pages/ShelterList";
import Unauthorized from "./pages/Unauthorized";
import ApplicationsSent from "./pages/profile/ApplicationSent.tsx";
import ApplicationsReceived from "./pages/profile/ApplicationsReceived.tsx";
import BookmarksPage from "./pages/profile/Bookmarks.tsx";

function App() {
  return (
    <AuthProvider>
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
          <Route element={<UserSidebarLayout />}>
            <Route
              path="/user/:id/profil"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/:id/profil/animaux/creer"
              element={
                <ProtectedRoute>
                  <AnimalForm />
                </ProtectedRoute>
              }
            />
            <Route path="/user/:id/animaux" element={<ShelterAnimalList />} />
            <Route
              path="/user/:userId/animaux/:id"
              element={
                <ProtectedRoute>
                  <AnimalDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/user/:id/demandes" element={
              <ProtectedRoute>
              <ApplicationsSent />
              </ProtectedRoute>
            }
            />
            <Route path="/user/:id/demandes-recus" element={
              <ProtectedRoute>
              <ApplicationsReceived />
              </ProtectedRoute>} 
              />

            <Route path="/user/:id/favoris" element={
              <ProtectedRoute>
              <BookmarksPage />
              </ProtectedRoute>
              } />

          </Route>

          {/* Route 404 */}
          <Route path="*" element={<NotFound />} />
          {/* Route Unauthorized */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* Route Forbidden */}
          <Route path="/forbidden" element={<Forbidden />} />
        </Route>

        {/* ZONE ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={
              <ProtectedRoute roles={["admin"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="utilisateurs"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="animaux"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminAnimals />
              </ProtectedRoute>
            }
          />
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
    </AuthProvider>
  );
}

export default App;
