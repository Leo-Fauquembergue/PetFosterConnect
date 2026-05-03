import { type UpdateUserWithIndividualProfileDto } from "@projet/shared-types";
import { useFormContext } from "react-hook-form";
import Checkbox from "../ui/Checkbox";
import Input from "../ui/Input";
import Select from "../ui/Select";

export default function IndividualProfileForm() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<UpdateUserWithIndividualProfileDto>();

  const availableFamily = watch("availableFamily");

  return (
    <div className="space-y-4">
      <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
      <Input
        label="Téléphone"
        type="tel"
        onlyDigits
        {...register("phoneNumber")}
        error={errors.phoneNumber?.message}
      />
      <Input
        label="Adresse complète"
        type="text"
        {...register("address")}
        error={errors.address?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Type de logement"
          {...register("housingType")}
          error={errors.housingType?.message}
        >
          <option value="house">Maison</option>
          <option value="apartment">Appartement</option>
          <option value="other">Autre</option>
        </Select>
        <Input
          label="Surface (m²)"
          type="number"
          {...register("surface", {
            setValueAs: (v) => (v === "" ? null : Number(v)),
          })}
          error={errors.surface?.message}
        />
      </div>

      <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-md">
        <Checkbox label="J'ai un jardin clos" {...register("haveGarden")} />
        <Checkbox label="J'ai d'autres animaux" {...register("haveAnimals")} />
        <Checkbox label="J'ai des enfants à charge" {...register("haveChildren")} />
      </div>

      <div className="border-t pt-4">
        <Checkbox label="Je souhaite devenir Famille d'Accueil" {...register("availableFamily")} />
        {availableFamily && (
          <div className="mt-4">
            <Input
              label="Mes disponibilités"
              type="text"
              {...register("availableTime")}
              placeholder="Ex: Soir et week-end, télétravail..."
              error={errors.availableTime?.message}
            />
          </div>
        )}
      </div>
    </div>
  );
}
