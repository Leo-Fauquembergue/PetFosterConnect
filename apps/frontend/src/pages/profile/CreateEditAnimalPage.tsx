import { zodResolver } from "@hookform/resolvers/zod";
import {
  type AnimalWithRelations,
  type CreateAnimalDto,
  CreateAnimalSchema,
} from "@projet/shared-types";
import { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { z } from "zod";
import { animalApi } from "../../api/animalApi";
import { extractErrorMessage } from "../../api/api";
import { speciesApi } from "../../api/speciesApi";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";

// On utilise z.input pour le type du formulaire afin de refléter l'état "brut"
// (champs optionnels avec défauts, etc.) avant validation.
type AnimalFormInput = z.input<typeof CreateAnimalSchema>;

export default function AnimalForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const animal = location.state?.animal as AnimalWithRelations | undefined;
  const [species, setSpecies] = useState<{ id: number; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AnimalFormInput>({
    resolver: zodResolver(CreateAnimalSchema),
    defaultValues: {
      name: animal?.name ?? "",
      age: animal?.age ?? "",
      description: animal?.description ?? "",
      sex: animal?.sex ?? "unknown",
      weight: animal?.weight ?? undefined,
      height: animal?.height ?? undefined,
      animalStatus: animal?.animalStatus ?? "available",
      photos: (animal?.photos as string[]) ?? [],
      acceptOtherAnimals: animal?.acceptOtherAnimals ?? false,
      acceptChildren: animal?.acceptChildren ?? false,
      needGarden: animal?.needGarden ?? false,
      treatment: animal?.treatment ?? "",
      speciesId: animal?.species?.id ?? undefined,
    },
  });

  const watchedPhotos = watch("photos");
  const watchedName = watch("name");

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const data = await speciesApi.getAllSpecies();
        setSpecies(data);
      } catch (error) {
        const errorMessage = extractErrorMessage(error, "Erreur lors du chargement des espèces.");
        toast.error(errorMessage);
      }
    };
    fetchSpecies();
  }, []);

  // SubmitHandler reçoit le type d'entrée, mais grâce au resolver,
  // les données sont déjà validées et transformées selon le schéma de sortie.
  const onSubmit: SubmitHandler<AnimalFormInput> = async (data) => {
    try {
      // On parse à nouveau pour garantir le type de sortie CreateAnimalDto (conversion des types, etc.)
      const validatedData = CreateAnimalSchema.parse(data) as CreateAnimalDto;

      if (animal) {
        await animalApi.updateAnimal(animal.id, validatedData);
        toast.success("Animal modifié avec succès 🎉");
      } else {
        await animalApi.createAnimal(validatedData);
        toast.success("Animal créé avec succès 🎉");
      }
      navigate(-1);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "Erreur lors de l'enregistrement.");
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-bgapp font-openSans text-gray-800">
      <main className="container mx-auto px-4 py-8 flex-grow">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
        >
          {/* SECTION PHOTOS */}
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden shadow-lg h-[400px] bg-gray-200">
              <img
                src={
                  (Array.isArray(watchedPhotos) && watchedPhotos[0]) ||
                  "https://placehold.co/600x600"
                }
                alt={watchedName || "Nouvel animal"}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <Input
                label="Photos (URLs séparées par des virgules)"
                {...register("photos", {
                  setValueAs: (v: string | string[]) => {
                    if (Array.isArray(v)) return v;
                    return v
                      .split(",")
                      .map((url) => url.trim())
                      .filter(Boolean);
                  },
                })}
                defaultValue={animal?.photos?.join(", ") ?? ""}
                error={errors.photos?.message}
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
                {...register("name")}
                error={errors.name?.message}
              />

              <Input
                label="Âge"
                type="text"
                placeholder="Ex: 3 ans"
                {...register("age")}
                error={errors.age?.message}
              />

              <Select label="Sexe" {...register("sex")} error={errors.sex?.message}>
                <option value="male">Mâle</option>
                <option value="female">Femelle</option>
                <option value="unknown">Inconnu</option>
              </Select>

              <Select
                label="Espèce"
                {...register("speciesId", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                error={errors.speciesId?.message}
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
                {...register("animalStatus")}
                error={errors.animalStatus?.message}
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
                step="any"
                placeholder="Ex: 15"
                {...register("weight", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                error={errors.weight?.message}
              />
              <Input
                label="Taille (cm)"
                type="number"
                step="any"
                placeholder="Ex: 45"
                {...register("height", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                error={errors.height?.message}
              />
            </div>

            {/* Compatibilité */}
            <div className="mb-6 w-full">
              <h2 className="text-xl font-bold text-success mb-2">Compatibilité</h2>
              <div className="flex flex-wrap gap-4 mt-2">
                <Checkbox
                  label="Ok enfants"
                  {...register("acceptChildren")}
                  error={errors.acceptChildren?.message}
                />
                <Checkbox
                  label="Ok autres animaux"
                  {...register("acceptOtherAnimals")}
                  error={errors.acceptOtherAnimals?.message}
                />
                <Checkbox
                  label="Besoin de jardin"
                  {...register("needGarden")}
                  error={errors.needGarden?.message}
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
                {...register("treatment")}
                error={errors.treatment?.message}
              />
            </div>

            {/* Description */}
            <div className="mb-6 w-full space-y-4">
              <h2 className="text-xl font-bold text-success mb-2">Description</h2>
              <Textarea
                label="Description détaillée"
                {...register("description")}
                error={errors.description?.message}
              />
            </div>

            {/* Boutons */}
            <div className="border-t-2 border-gray-300 pt-6 flex justify-between w-full mt-auto">
              <Button type="button" variant="neutral" onClick={() => navigate(-1)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
