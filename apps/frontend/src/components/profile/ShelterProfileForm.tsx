import { type UpdateUserWithShelterProfileDto } from "@projet/shared-types";
import { useFormContext } from "react-hook-form";
import { CiSettings } from "react-icons/ci";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

type Props = {
  siret?: string;
};

export default function ShelterProfileForm({ siret }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<UpdateUserWithShelterProfileDto>();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CiSettings className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-700">Paramètres du Refuge</h2>
      </div>

      <Input
        label="URL du Logo"
        type="text"
        {...register("logo")}
        placeholder="https://exemple.com/mon-logo.png"
        error={errors.logo?.message}
      />

      <Input
        label="Email de contact"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />

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

      <Input
        label="Nom du refuge"
        type="text"
        {...register("shelterName")}
        error={errors.shelterName?.message}
      />

      <Input
        label="SIRET (Non modifiable)"
        type="text"
        value={siret || ""}
        readOnly
        disabled
        className="bg-gray-100 cursor-not-allowed"
      />

      <Textarea
        label="Description / Présentation"
        {...register("description")}
        rows={4}
        error={errors.description?.message}
      />
    </div>
  );
}
