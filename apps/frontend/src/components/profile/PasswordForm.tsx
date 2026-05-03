import { zodResolver } from "@hookform/resolvers/zod";
import { type UpdatePasswordDto, UpdatePasswordSchema } from "@projet/shared-types";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../../api/api";
import { userApi } from "../../api/userApi";
import Button from "../ui/Button";
import InputPassword from "../ui/InputPassword";

type Props = {
  userId: number;
};

export default function PasswordForm({ userId }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordDto>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = async (data: UpdatePasswordDto) => {
    try {
      await userApi.updatePassword(userId, data);
      toast.success("Mot de passe modifié avec succès !");
      reset();
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(
        err,
        "Erreur lors de la modification du mot de passe."
      );
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputPassword
        label="Ancien mot de passe"
        {...register("oldPassword")}
        error={errors.oldPassword?.message}
      />
      <InputPassword
        label="Nouveau mot de passe"
        {...register("newPassword")}
        error={errors.newPassword?.message}
      />
      <Button type="submit" disabled={isSubmitting} variant="info" fullWidth className="md:w-auto">
        {isSubmitting ? "Mise à jour..." : "Mettre à jour le mot de passe"}
      </Button>
    </form>
  );
}
