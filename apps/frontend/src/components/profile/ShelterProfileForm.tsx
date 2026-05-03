import type { UpdateUserWithShelterProfileDto } from "@projet/shared-types";
import { CiSettings } from "react-icons/ci";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

type Props = {
  formData: Required<UpdateUserWithShelterProfileDto>;
  onChange: <K extends keyof Props["formData"]>(field: K, value: Props["formData"][K]) => void;
  siret?: string;
};

export default function ShelterProfileForm({ formData, onChange, siret }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CiSettings className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-700">Paramètres du Refuge</h2>
      </div>

      <Input
        label="URL du Logo"
        type="text"
        value={formData.logo || ""}
        onChange={(e) => onChange("logo", e.target.value)}
        placeholder="https://exemple.com/mon-logo.png"
      />

      <Input
        label="Email de contact"
        type="email"
        value={formData.email}
        onChange={(e) => onChange("email", e.target.value)}
      />

      <Input
        label="Téléphone"
        type="tel"
        value={formData.phoneNumber || ""}
        onChange={(e) => onChange("phoneNumber", e.target.value)}
      />

      <Input
        label="Adresse complète"
        type="text"
        value={formData.address || ""}
        onChange={(e) => onChange("address", e.target.value)}
      />

      <Input
        label="Nom du refuge"
        type="text"
        value={formData.shelterName}
        onChange={(e) => onChange("shelterName", e.target.value)}
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
        value={formData.description || ""}
        onChange={(e) => onChange("description", e.target.value)}
        rows={4}
      />
    </div>
  );
}
