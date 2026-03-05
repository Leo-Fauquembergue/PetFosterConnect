import { CreateAnimalSchema } from "@projet/shared-types";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { animalApi } from "../../api/animalApi";
import { speciesApi } from "../../api/speciesApi";
import Checkbox from "../../components/ui/Checkbox";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";

type FormData = {
  name: string;
  age: string;
  description: string;
  sex: string;
  weight: string;
  height: string;
  animalStatus: string;
  photos: string[];
  acceptOtherAnimals: boolean;
  acceptChildren: boolean;
  needGarden: boolean;
  treatment: string;
  speciesId: string | number;
};

export default function AnimalForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const animal = location.state?.animal;
  const [species, setSpecies] = useState<{ id: number; name: string }[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: animal?.name ?? "",
    age: animal?.age ?? "",
    description: animal?.description ?? "",
    sex: animal?.sex ?? "unknown",
    weight: animal?.weight ?? "",
    height: animal?.height ?? "",
    animalStatus: animal?.animalStatus ?? "available",
    photos: animal?.photos ?? [],
    acceptOtherAnimals: animal?.acceptOtherAnimals ?? false,
    acceptChildren: animal?.acceptChildren ?? false,
    needGarden: animal?.needGarden ?? false,
    treatment: animal?.treatment ?? "",
    speciesId: animal?.species?.id ?? "",
  });

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const data = await speciesApi.getAllSpecies();
        setSpecies(data);
      } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const errorMessage =
          err.response?.data?.message || "Erreur lors du chargement des espèces.";
        toast.error(errorMessage);
      }
    };
    fetchSpecies();
  }, []);

  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    const parsedData = {
      ...formData,
      weight: formData.weight === "" ? undefined : Number(formData.weight),
      height: formData.height === "" ? undefined : Number(formData.height),
      speciesId: formData.speciesId === "" ? undefined : Number(formData.speciesId),
    };

    try {
      const parsed = CreateAnimalSchema.parse(parsedData);
      if (animal) {
        await animalApi.updateAnimal(animal.id, parsed);
        toast.success("Animal modifié avec succès 🎉");
      } else {
        await animalApi.createAnimal(parsed);
        toast.success("Animal créé avec succès 🎉");
      }
      navigate(-1);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      if (err && typeof err === "object" && ("issues" in err || "errors" in err)) {
        toast.error("Formulaire invalide : veuillez vérifier les champs.");
      } else {
        const errorMessage = err.response?.data?.message || "Erreur lors de l'enregistrement.";
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-bgapp font-openSans text-gray-800">
      <main className="container mx-auto px-4 py-8 flex-grow">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
        >
          {/* SECTION PHOTOS */}
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden shadow-lg h-[400px] bg-gray-200">
              <img
                src={formData.photos[0] || "https://placehold.co/600x600"}
                alt={formData.name || "Nouvel animal"}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <Input
                label="Photos (URLs séparées par des virgules)"
                value={formData.photos.join(",")}
                onChange={(e) =>
                  handleChange(
                    "photos",
                    e.target.value.split(",").map((url) => url.trim())
                  )
                }
                className="w-full"
              />
            </div>
          </div>

          {/* SECTION INFORMATIONS */}
          <div className="bg-gray-100 p-8 rounded-lg shadow-sm text-left flex flex-col items-start h-full">
            {/* Infos générales */}
            <div className="mb-6 w-full space-y-4">
              <h2 className="text-xl font-bold text-success mb-2">
                {animal ? "Modifier l'animal" : "Créer un nouvel animal"}
              </h2>

              <Input
                label="Nom de l'animal"
                type="text"
                placeholder="Ex: Rex"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />

              <Input
                label="Âge"
                type="text"
                placeholder="Ex: 3 ans"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
              />

              <Select
                label="Sexe"
                value={formData.sex}
                onChange={(e) => handleChange("sex", e.target.value)}
              >
                <option value="male">Mâle</option>
                <option value="female">Femelle</option>
                <option value="unknown">Inconnu</option>
              </Select>

              <Select
                label="Espèce"
                value={formData.speciesId.toString()}
                onChange={(e) => handleChange("speciesId", Number(e.target.value))}
              >
                <option value="">-- Sélectionner une espèce --</option>
                {species.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Statut"
                value={formData.animalStatus}
                onChange={(e) => handleChange("animalStatus", e.target.value)}
              >
                <option value="available">Disponible</option>
                <option value="adopted">Adopté</option>
                <option value="foster_care">Famille d'accueil</option>
                <option value="unavailable">Indisponible</option>
              </Select>
            </div>

            {/* Caractéristiques physiques */}
            <div className="mb-6 w-full space-y-4">
              <h2 className="text-xl font-bold text-success mb-2">Caractéristiques physiques</h2>
              <Input
                label="Poids (kg)"
                type="number"
                placeholder="Ex: 15"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
              />
              <Input
                label="Taille (cm)"
                type="number"
                placeholder="Ex: 45"
                value={formData.height}
                onChange={(e) => handleChange("height", e.target.value)}
              />
            </div>

            {/* Compatibilité */}
            <div className="mb-6 w-full">
              <h2 className="text-xl font-bold text-success mb-2">Compatibilité</h2>
              <div className="flex flex-wrap gap-4 mt-2">
                <Checkbox
                  label="Ok enfants"
                  checked={formData.acceptChildren}
                  onChange={(e) => handleChange("acceptChildren", e.target.checked)}
                />
                <Checkbox
                  label="Ok autres animaux"
                  checked={formData.acceptOtherAnimals}
                  onChange={(e) => handleChange("acceptOtherAnimals", e.target.checked)}
                />
                <Checkbox
                  label="Besoin de jardin"
                  checked={formData.needGarden}
                  onChange={(e) => handleChange("needGarden", e.target.checked)}
                />
              </div>
            </div>

            {/* Santé */}
            <div className="mb-6 w-full space-y-4">
              <h2 className="text-xl font-bold text-success mb-2">Soins & Traitements</h2>
              <Input
                label="Traitement médical"
                type="text"
                placeholder="Ex: Aucun ou nom du traitement"
                value={formData.treatment}
                onChange={(e) => handleChange("treatment", e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="mb-6 w-full space-y-4">
              <h2 className="text-xl font-bold text-success mb-2">Description</h2>
              <Textarea
                label="Description détaillée"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            {/* Boutons */}
            <div className="border-t-2 border-gray-300 pt-6 flex justify-between w-full mt-auto">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
