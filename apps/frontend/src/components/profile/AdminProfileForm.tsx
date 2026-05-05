import { type UpdateUserDto } from "@projet/shared-types";
import { useFormContext } from "react-hook-form";
import { CiSettings } from "react-icons/ci";
import Input from "../ui/Input";

export default function AdminProfileForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<UpdateUserDto>();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CiSettings className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-700">Paramètres Administrateur</h2>
      </div>

      <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />

      <Input
        label="Téléphone"
        type="tel"
        onlyDigits
        {...register("phoneNumber")}
        error={errors.phoneNumber?.message}
      />

      <Input label="Adresse" type="text" {...register("address")} error={errors.address?.message} />
    </div>
  );
}
