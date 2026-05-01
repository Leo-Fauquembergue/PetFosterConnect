import { useState } from "react";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../../api/api";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await userApi.updatePassword(userId, formData);
      toast.success("Mot de passe modifié avec succès !");
      setFormData({ oldPassword: "", newPassword: "" });
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, "Erreur lors de la modification du mot de passe.");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Mise à jour..." : "Mettre à jour le mot de passe"}
      </button>
    </form>
  );
}
