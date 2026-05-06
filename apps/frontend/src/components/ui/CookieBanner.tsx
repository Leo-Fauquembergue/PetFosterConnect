import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait un choix
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (choice: "accepted" | "rejected") => {
    localStorage.setItem("cookie-consent", choice);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-grow text-center md:text-left">
          <h3 className="text-lg font-bold text-secondary mb-2 font-montserrat">
            Respect de votre vie privée 🐾
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Nous utilisons des cookies pour améliorer votre expérience sur Pet Foster Connect.
            Certains sont essentiels, d'autres nous aident à mieux vous accompagner. Consultez notre{" "}
            <Link to="/confidentialite" className="text-primary font-semibold hover:underline">
              politique de confidentialité
            </Link>{" "}
            pour en savoir plus.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <Button
            variant="ghost"
            onClick={() => handleConsent("rejected")}
            className="text-gray-500 hover:text-gray-700"
          >
            Refuser
          </Button>
          <Button variant="primary" onClick={() => handleConsent("accepted")} className="px-8">
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
}
