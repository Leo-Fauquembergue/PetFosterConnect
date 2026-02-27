import { CiSettings } from "react-icons/ci";
import Input from "../ui/Input";

type Props = {
  formData: {
    logo: string;
    email: string;
    phoneNumber: string;
    address: string;
    shelterName: string;
    siret: string;
    description: string;
  };
  onChange: (field: keyof Props["formData"], value: any) => void;
};

export default function ShelterProfileForm({ formData, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Logo */}
      <div className="relative inline-block mb-2">
        {formData.logo ? (
          <img src={formData.logo} alt="Logo du refuge" className="h-20 w-20 object-cover rounded shadow-sm border border-gray-100" />
        ) : (
          <div className="h-20 w-20 bg-gray-100 flex items-center justify-center rounded text-sm text-gray-500 border border-gray-200">
            Non renseigné
          </div>
        )}
        <label
          htmlFor="logo-link"
          className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md cursor-pointer hover:bg-gray-50 border border-gray-100"
        >
          <CiSettings className="w-5 h-5 text-gray-600" />
        </label>
      </div>

      <Input
        id="logo-link"
        label="Lien vers le logo (URL)"
        type="text"
        value={formData.logo}
        onChange={(e) => onChange("logo", e.target.value)}
        placeholder="https://..."
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => onChange("email", e.target.value)}
      />

      <Input
        label="Téléphone"
        type="text"
        value={formData.phoneNumber}
        onChange={(e) => onChange("phoneNumber", e.target.value)}
      />

      <Input
        label="Adresse"
        type="text"
        value={formData.address}
        onChange={(e) => onChange("address", e.target.value)}
      />

      <Input
        label="Nom du refuge"
        type="text"
        value={formData.shelterName}
        onChange={(e) => onChange("shelterName", e.target.value)}
      />

      <Input
        label="SIRET"
        type="text"
        value={formData.siret}
        onChange={(e) => onChange("siret", e.target.value)}
      />

      {/* Textarea stylisé avec htmlFor et id pour l'accessibilité */}
      <div>
        <label 
          htmlFor="description" 
          className="block text-sm font-medium text-gray-700 font-openSans mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-800"
          rows={4}
        />
      </div>
    </div>
  );
}