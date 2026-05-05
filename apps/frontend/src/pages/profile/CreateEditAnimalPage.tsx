import { zodResolver } from "@hookform/resolvers/zod";
import {
  type AnimalWithRelations,
  type CreateAnimalDto,
  CreateAnimalSchema,
} from "@projet/shared-types";
import { useEffect, useState } from "react";
import { type Control, type SubmitHandler, useForm, useWatch } from "react-hook-form";
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
type AnimalFormInput = z.input<typeof CreateAnimalSchema>;

// Composant isolé pour la prévisualisation afin d'éviter les re-rendus globaux
function AnimalPreview({ control }: { control: Control<AnimalFormInput> }) {
  const photos = useWatch({ control, name: "photos" });
  const name = useWatch({ control, name: "name" });

  const firstPhoto = Array.isArray(photos) ? photos[0] : "";

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg h-[400px] bg-gray-200">
      <img
        src={firstPhoto || "https://placehold.co/600x600"}
        alt={name || "Nouvel animal"}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default function AnimalForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const animal = location.state?.animal as AnimalWithRelations | undefined;
  const [species, setSpecies] = useState<{ id: number; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
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

  const onSubmit: SubmitHandler<AnimalFormInput> = async (data) => {
    try {
      // Grâce au zodResolver, 'data' est déjà validé et transformé en CreateAnimalDto
      const validatedData = data as CreateAnimalDto;

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
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        {animal ? "Modifier l'animal" : "Ajouter un nouvel animal"}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
      >
        {/* SECTION PHOTOS */}
        <div className="space-y-6">
          <AnimalPreview control={control} />
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Photos</h2>
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
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start">
          {/* Infos générales */}
          <div className="mb-8 w-full space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">
              {" "}
              Informations générales
            </h2>

            <Input
              label="Nom de l'animal"
              type="text"
              placeholder="Ex: Rex"
              {...register("name")}
              error={errors.name?.message}
            />

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Espèce"
                {...register("speciesId", { valueAsNumber: true })}
                error={errors.speciesId?.message}
              >
                <option value="">-- Sélectionner --</option>
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
                <option value="foster_care">En famille d'accueil</option>
                <option value="unavailable">Indisponible</option>
              </Select>
            </div>
          </div>

          {/* Caractéristiques physiques */}
          <div className="mb-8 w-full space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">
              Caractéristiques physiques
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Poids (kg)"
                type="number"
                step="any"
                placeholder="Ex: 15"
                {...register("weight", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
                error={errors.weight?.message}
              />
              <Input
                label="Taille (cm)"
                type="number"
                step="any"
                placeholder="Ex: 45"
                {...register("height", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
                error={errors.height?.message}
              />
            </div>
          </div>

          {/* Compatibilité */}
          <div className="mb-8 w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">
              Compatibilité
            </h2>
            <div className="flex flex-wrap gap-6 mt-2">
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
          <div className="mb-8 w-full space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">
              Soins & Traitements
            </h2>
            <Input
              label="Traitement médical"
              type="text"
              placeholder="Ex: Aucun ou nom du traitement"
              {...register("treatment")}
              error={errors.treatment?.message}
            />
          </div>

          {/* Description */}
          <div className="mb-8 w-full space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">
              Description
            </h2>
            <Textarea
              label="Description détaillée"
              rows={4}
              {...register("description")}
              error={errors.description?.message}
            />
          </div>

          {/* Boutons */}
          <div className="pt-8 flex justify-between gap-4 w-full mt-auto border-t border-gray-100">
            <Button type="button" variant="neutral" onClick={() => navigate(-1)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="px-10">
              {isSubmitting ? "Enregistrement..." : "Enregistrer l'animal"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
