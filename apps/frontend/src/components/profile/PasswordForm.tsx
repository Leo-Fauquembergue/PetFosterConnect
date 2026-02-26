import { useState } from "react";
import { toast } from "react-toastify";
import { userApi } from "../../api/userApi";
import InputPassword from "../ui/InputPassword";

type Props = {
  userId: number;
};

export default function PasswordForm({ userId }: Props) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.updatePassword(userId, formData);
      toast.success("Mot de passe modifié avec succès !");
      setFormData({ oldPassword: "", newPassword: "" });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la modification du mot de passe.";
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputPassword
        label="Ancien mot de passe"
        value={formData.oldPassword}
        onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
      />

      <InputPassword
        label="Nouveau mot de passe"
        value={formData.newPassword}
        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full md:w-auto"
      >
        Mettre à jour le mot de passe
      </button>
    </form>
  );
}