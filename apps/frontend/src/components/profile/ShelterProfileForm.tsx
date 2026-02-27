import { CiSettings } from "react-icons/ci";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

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
          <img
            src={formData.logo}
            alt="Logo du refuge"
            className="h-20 w-20 object-cover rounded shadow-sm border border-gray-100"
          />
        ) : (
          <div className="h-20 w-20 bg-gray-100 flex items-center justify-center rounded text-sm text-gray-500 border border-gray-200">
            Non renseigné
          </div>
        )}
        <label
          htmlFor="logo-link"
          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow border border-gray-200 cursor-pointer hover:bg-gray-50"
        >
          <CiSettings size={18} className="text-gray-600" />
        </label>
      </div>

      <Input
        id="logo-link"
        label="Lien de l'image (Logo)"
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

      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => onChange("description", e.target.value)}
        placeholder="Présentez votre refuge..."
      />
    </div>
  );
}