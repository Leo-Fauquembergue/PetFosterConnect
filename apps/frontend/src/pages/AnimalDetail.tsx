import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AlertCircle, Heart } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SiteLogo from "../assets/Logo.png";
import { useAuth } from "../auth/AuthContext"; // Majuscule suite à ton renommage !
import BackBanner from "../components/ui/BackBanner";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CompatibilityBadge from "../components/ui/CompatibilityBadge";
import Input from "../components/ui/Input";
import Loader from "../components/ui/Loader";
import { toast } from "react-toastify";
import { api } from "../api/api"; // L'import magique

export default function AnimalDetail() {
  const { userId, id } = useParams<{ userId: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasApplied, setHasApplied] = useState(false);
  const [animal, setAnimal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [adoptMessage, setAdoptMessage] = useState("");
  const [fosterMessage, setFosterMessage] = useState("");

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const response = await api.get(`/animals/${id}`);
        const data = response.data;
        
        setAnimal(data);
        if (data.isBookmarked !== undefined) setIsFavorite(data.isBookmarked);
        if (data.photos?.length > 0) setSelectedPhoto(data.photos[0]);
      } catch (error) {
        setError("Impossible de charger les détails de l'animal.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAnimal();
  }, [id]);

  const handleAdopt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/applications", {
        animalId: Number(id),
        applicationType: "adoption",
        message: adoptMessage,
      });
      toast.success("Demande d'adoption envoyée !");
      setHasApplied(true);
    } catch (error: any) {
      toast.error(`Erreur: ${error.response?.data?.message || "Erreur lors de la demande"}`);
    }
  };

  const handleFoster = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/applications", {
        animalId: Number(id),
        applicationType: "foster",
        message: fosterMessage,
      });
      toast.success("Demande d'accueil envoyée !");
      setHasApplied(true);
    } catch (error: any) {
      toast.error(`Erreur: ${error.response?.data?.message || "Erreur lors de la demande"}`);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await api.post("/bookmarks/toggle", { animalId: Number(id) });
      setIsFavorite(response.data.bookmarked);
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur réseau");
    }
  };

  const exportToPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const logoWidth = 40;
    const logoX = (pdf.internal.pageSize.getWidth() - logoWidth) / 2;

    pdf.addImage(SiteLogo, "PNG", logoX, 10, logoWidth, 40);
    const element = document.getElementById("animal-detail");
    if (!element) return;

    const buttons = document.querySelectorAll(".no-print");
    buttons.forEach((btn) => ((btn as HTMLElement).style.display = "none"));

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    buttons.forEach((btn) => ((btn as HTMLElement).style.display = ""));

    const imgData = canvas.toDataURL("image/png");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const animalUrl = `${window.location.origin}/animaux/${animal.id}`;
    const qrData = await QRCode.toDataURL(animalUrl);

    const logoUrl = animal.shelter?.shelterProfile?.logoUrl;
    if (logoUrl) {
      const logoWidth = 40;
      const logoX = (pageWidth - logoWidth) / 2;
      pdf.addImage(logoUrl, "PNG", logoX, 10, logoWidth, 40);
    }

    pdf.addImage(qrData, "PNG", pageWidth - 40 - 10, 250, 40, 40);
    const imgWidth = pageWidth * 0.9;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const x = (pageWidth - imgWidth) / 2;
    pdf.addImage(imgData, "PNG", x, 60, imgWidth, imgHeight);
    pdf.save(`animal-${animal.name}.pdf`);
  };

  if (loading) return (
      <div className="h-screen flex items-center justify-center">
          <Loader text="Chargement des détails..." />
      </div>
  );

  if (error || !animal) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-gray-300" />
        <p className="text-lg text-gray-500">{error || "Animal introuvable."}</p>
        <Button onClick={() => navigate("/animaux")}>Retour à la liste</Button>
    </div>
  );

  const photoArray = Array.isArray(animal.photos) ? animal.photos : [];
  const isShelterOwner =
    user?.role === "shelter" &&
    Number(user?.id) === Number(userId) &&
    (animal.shelter?.pfcUserId
      ? Number(animal.shelter.pfcUserId) === Number(userId)
      : true);

  return (
    <div className="bg-bgapp font-openSans text-gray-800">
      {!isShelterOwner && <BackBanner to="/animaux" />}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div id="animal-detail" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden shadow-lg h-[500px] lg:h-[600px] bg-gray-200">
              <img
                src={selectedPhoto || (Array.isArray(animal.photos) ? animal.photos[0] : "https://placehold.co/600x600")}
                alt={animal.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
              <button
                className="absolute top-4 right-4 bg-white/90 p-3 rounded-full hover:bg-white transition shadow-md group no-print"
                type="button"
                onClick={handleToggleFavorite}
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart className={`w-7 h-7 transition-all duration-300 ${isFavorite ? "fill-error text-error scale-110" : "text-gray-400 group-hover:text-error"}`} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 no-print">
              {photoArray.map((photo: string, index: number) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setSelectedPhoto(photo)}
                  className={`h-24 rounded-lg overflow-hidden border-4 transition-all ${selectedPhoto === photo ? "border-success scale-95" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={photo} alt={`Miniature ${index}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-100 p-8 rounded-lg shadow-sm text-left flex flex-col items-start h-full">
            <div className="flex justify-between items-start mb-2 w-full">
              <div>
                <h1 className="text-4xl font-bold font-montserrat text-black">{animal.name}</h1>
                <p className="text-lg text-gray-600">{animal.species.name}</p>
              </div>
              {animal.animalStatus === "available" && <Badge label="Disponible" variant="success" />}
            </div>

            <div className="mt-6 w-full">
              <h2 className="text-xl font-bold text-success mb-2 font-montserrat">Informations Générales</h2>
              <ul className="text-sm space-y-1 text-gray-700">
                <li><span className="font-semibold">Age :</span> {animal.age} ans</li>
                <li><span className="font-semibold">Sexe :</span> {animal.sex === "male" ? "Mâle" : "Femelle"}</li>
                <li><span className="font-semibold">Taille :</span> {animal.height} cm</li>
                <li><span className="font-semibold">Poids :</span> {animal.weight} kg</li>
              </ul>
            </div>

            <div className="mt-6 w-full">
              <h2 className="text-xl font-bold text-success mb-2 font-montserrat">A propos de {animal.name}</h2>
              <p className="text-sm leading-relaxed text-gray-700">{animal.description}</p>
            </div>

            <div className="mt-6 w-full">
              <h2 className="text-xl font-bold text-success mb-3 font-montserrat">Compatibilité</h2>
              <div className="flex flex-wrap gap-3 justify-start">
                <CompatibilityBadge label="Accepte enfants" isCompatible={animal.acceptChildren} />
                <CompatibilityBadge label="Accepte animaux" isCompatible={animal.acceptOtherAnimals} />
                <CompatibilityBadge label={animal.needGarden ? "Jardin requis" : "Appartement OK"} isCompatible={!animal.needGarden} />
              </div>
            </div>

            <div className="mt-6 w-full">
              <h2 className="text-xl font-bold text-success mb-2 font-montserrat">Soins & Traitements</h2>
              <p className="text-sm text-gray-700 whitespace-pre-line">{animal.treatment}</p>
            </div>

            <div className="mt-6 mb-8 w-full">
              <h2 className="text-xl font-bold text-success mb-1 font-montserrat">Proposé par</h2>
              <p className="text-sm font-semibold text-gray-900">{animal.shelter?.shelterProfile?.shelterName || "Refuge partenaire"}</p>
              <p className="text-xs text-gray-500"><span className="font-medium">Adresse :</span> {animal.shelter?.address || "Non communiquée"}</p>
            </div>

            <div className="border-t-2 border-gray-300 pt-6 flex flex-col gap-4 w-full mt-auto no-print">
              {isShelterOwner ? (
                <Button variant="primary" onClick={() => navigate(`/user/${user?.id}/profil/animaux/creer`, { state: { animal } })}>
                  Modifier
                </Button>
              ) : (
                hasApplied ? (
                    <p className="text-green-600 font-semibold">Demande déjà réalisée pour cet animal ✅</p>
                  ) : (
                    <>
                      <form onSubmit={handleAdopt} className="flex items-start gap-4">
                        <div className="flex-grow">
                          <Input label="Message d'adoption" placeholder="Pourquoi souhaitez-vous adopter ?" className="bg-white" value={adoptMessage} onChange={(e) => setAdoptMessage(e.target.value)} />
                        </div>
                        <div className="w-32 mt-[26px]">
                          <Button variant="primary" fullWidth type="submit">Adopter</Button>
                        </div>
                      </form>
                      <form onSubmit={handleFoster} className="flex items-start gap-4">
                        <div className="flex-grow">
                          <Input label="Message pour l'accueil" placeholder="Vos disponibilités et motivations..." className="bg-white" value={fosterMessage} onChange={(e) => setFosterMessage(e.target.value)} />
                        </div>
                        <div className="w-32 mt-[26px]">
                          <Button variant="primary" fullWidth type="submit">Accueillir</Button>
                        </div>
                      </form>
                    </>
                  )
              )}
              <button type="button" onClick={exportToPDF} className="bg-primary text-white px-4 py-2 rounded">
                Exporter en PDF
              </button>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}