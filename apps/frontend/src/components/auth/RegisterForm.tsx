import { useState } from "react";
import { UserRole, type RegisterDto } from "@projet/shared-types";
import Input from "../ui/Input";
import InputPassword from "../ui/InputPassword";
import Button from "../ui/Button";
import Radio from "../ui/Radio";

interface RegisterFormProps {
  onSubmit: (data: RegisterDto) => void;
  isLoading: boolean;
}

const RegisterForm = ({ onSubmit, isLoading }: RegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.individual);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [siret, setSiret] = useState("");
  const [shelterName, setShelterName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: RegisterDto = {
      email,
      password,
      role,
      phoneNumber,
      address,
    };
    if (role === UserRole.shelter) {
      data.siret = siret;
      data.shelterName = shelterName;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Sélecteur de Rôle */}
      <div className="flex gap-4 mb-4">
        <Radio
          label="Adoptant"
          name="role"
          value={UserRole.individual}
          checked={role === UserRole.individual}
          onChange={() => setRole(UserRole.individual)}
        />
        <Radio
          label="Refuge (Pro)"
          name="role"
          value={UserRole.shelter}
          checked={role === UserRole.shelter}
          onChange={() => setRole(UserRole.shelter)}
        />
      </div>

      <Input
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <InputPassword
        label="Mot de passe"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Input
        label="Téléphone"
        type="tel"
        required
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />

      <Input
        label="Adresse"
        type="text"
        required
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      {/* Champs Spécifiques Refuge */}
      {role === UserRole.shelter && (
        <div className="space-y-4 rounded-md bg-gray-50 p-4 border border-gray-200 mt-2">
          <Input
            label="Nom du Refuge"
            type="text"
            required={role === UserRole.shelter}
            value={shelterName}
            onChange={(e) => setShelterName(e.target.value)}
          />
          
          <Input
            label="SIRET (14 chiffres)"
            type="text"
            required={role === UserRole.shelter}
            maxLength={14}
            value={siret}
            onChange={(e) => setSiret(e.target.value)}
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        fullWidth
        className="mt-4"
      >
        {isLoading ? "Inscription en cours..." : "Créer mon compte"}
      </Button>
    </form>
  );
};

export default RegisterForm;