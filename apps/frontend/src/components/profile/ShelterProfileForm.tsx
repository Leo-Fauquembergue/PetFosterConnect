import { CiSettings } from "react-icons/ci";

type Props = {
  formData: {
    logo: string; // URL renvoyée par le backend
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
          {/* Logo affiché depuis une URL */}
        <div className="relative inline-block">
          {formData.logo ? (
            <img
              src={formData.logo}
              alt="Logo du refuge"
              className="h-20 w-20 object-cover rounded"
            />
          ) : (
            <div className="h-20 w-20 bg-gray-200 flex items-center justify-center rounded">
              Non renseigné
            </div>
          )}
      
          {/* Icône engrenage pour modifier le lien */}
          <label
            htmlFor="logo-link"
            className="absolute top-0 right-0 bg-white rounded-full p-1 shadow cursor-pointer hover:bg-gray-100"
          >
            <CiSettings className="w-5 h-5 text-gray-600" />
          </label>
        </div>
      
        {/* Champ texte pour saisir l’URL du logo */}
        <input
          id="logo-link"
          type="text"
          value={formData.logo}
          onChange={(e) => onChange("logo", e.target.value)}
          placeholder="Lien vers le logo (URL)"
          className="border rounded p-2 w-full mt-2"
        />
      {/* Email */}
      <div>
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      {/* Téléphone */}
      <div>
        <label>Téléphone</label>
        <input
          type="text"
          value={formData.phoneNumber}
          onChange={(e) => onChange("phoneNumber", e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      {/* Adresse */}
      <div>
        <label>Adresse</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => onChange("address", e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      {/* Nom du refuge */}
      <div>
        <label>Nom du refuge</label>
        <input
          type="text"
          value={formData.shelterName}
          onChange={(e) => onChange("shelterName", e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      {/* SIRET */}
      <div>
        <label>SIRET</label>
        <input
          type="text"
          value={formData.siret}
          onChange={(e) => onChange("siret", e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      {/* Description */}
      <div>
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>
    </div>
  );
}
