import { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { toast } from "react-toastify";
import { api } from "../../../api/api";

type Props = {
  userId: number;
};

export default function PasswordForm({ userId }: Props) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/users/${userId}/password`, formData);
      toast.success("Mot de passe modifié avec succès !");
      setFormData({ oldPassword: "", newPassword: "" });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la modification du mot de passe.";
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative"> 
        <label className="block text-sm font-medium text-gray-700">Ancien mot de passe</label> 
        <input 
          type={showOldPassword ? "text" : "password"} 
          value={formData.oldPassword} 
          onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value }) }
          className="border rounded p-2 w-full pr-10 mt-1" 
        /> 
        <button type="button" 
          onClick={() => setShowOldPassword(!showOldPassword)} 
          className="absolute right-2 top-8 text-gray-600 hover:text-gray-800" 
        > 
          {showOldPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />} 
        </button> 
      </div> 

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
        <input
          type={showPassword ? "text" : "password"}
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          className="border rounded p-2 w-full pr-10 mt-1"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-8 text-gray-600 hover:text-gray-800"
        >
          {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
        </button>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full md:w-auto"
      >
        Mettre à jour le mot de passe
      </button>
    </form>
  );
}