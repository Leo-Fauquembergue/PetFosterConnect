import { useState } from "react";
import type { RegisterDto } from "@projet/shared-types";

interface RegisterFormProps {
  onSubmit: (data: RegisterDto) => void;
  isLoading: boolean;
}

const RegisterForm = ({ onSubmit, isLoading }: RegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"individual" | "shelter">("individual");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [siret, setSiret] = useState("");
  const [shelterName, setShelterName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construction stricte basée sur ton DTO
    const data: RegisterDto = {
      email,
      password,
      role,
      phoneNumber,
      address,
    };

    if (role === "shelter") {
      data.siret = siret;
      data.shelterName = shelterName;
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Sélecteur de Rôle */}
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="role"
            value="individual"
            checked={role === "individual"}
            onChange={() => setRole("individual")}
            className="text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-gray-700">Adoptant</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="role"
            value="shelter"
            checked={role === "shelter"}
            onChange={() => setRole("shelter")}
            className="text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-gray-700">Refuge (Pro)</span>
        </label>
      </div>

      {/* Champs Communs */}
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="reg-email"
          type="email"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
        <input
          id="reg-password"
          type="password"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Téléphone</label>
        <input
          id="phoneNumber"
          type="tel"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse</label>
        <input
          id="address"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {/* Champs Spécifiques Refuge */}
      {role === "shelter" && (
        <div className="space-y-4 rounded-md bg-gray-50 p-4 border border-gray-200">
          <div>
            <label htmlFor="shelterName" className="block text-sm font-medium text-gray-700">Nom du Refuge</label>
            <input
              id="shelterName"
              type="text"
              required={role === "shelter"}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={shelterName}
              onChange={(e) => setShelterName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="siret" className="block text-sm font-medium text-gray-700">SIRET (14 chiffres)</label>
            <input
              id="siret"
              type="text"
              required={role === "shelter"}
              maxLength={14}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center rounded-xl border border-transparent bg-primary py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors mt-4"
      >
        {isLoading ? "Inscription en cours..." : "Créer mon compte"}
      </button>
    </form>
  );
};

export default RegisterForm;