import Input from "../ui/Input";

type Props = {
  formData: {
    email: string;
    phoneNumber: string;
    address: string;
    surface: number;
    housingType: string;
    haveGarden: boolean;
    haveAnimals: boolean;
    haveChildren: boolean;
    availableFamily: boolean;
    availableTime?: string;
  };
  onChange: (field: keyof Props["formData"], value: any) => void;
};

export default function IndividualProfileForm({ formData, onChange }: Props) {
  return (
    <div className="space-y-4">
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
        label="Surface (m²)"
        type="number"
        value={formData.surface}
        onChange={(e) => onChange("surface", Number(e.target.value))}
      />

      {/* Select stylisé avec htmlFor et id pour l'accessibilité */}
      <div>
        <label 
          htmlFor="housingType" 
          className="block text-sm font-medium text-gray-700 font-openSans mb-1"
        >
          Type de logement
        </label>
        <select
          id="housingType"
          value={formData.housingType}
          onChange={(e) => onChange("housingType", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white text-gray-800"
        >
          <option value="house">Maison</option>
          <option value="apartment">Appartement</option>
          <option value="other">Autre</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
            checked={formData.haveGarden}
            onChange={(e) => onChange("haveGarden", e.target.checked)}
          />
          <span className="text-sm text-gray-700">Jardin</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
            checked={formData.haveAnimals}
            onChange={(e) => onChange("haveAnimals", e.target.checked)}
          />
          <span className="text-sm text-gray-700">Animaux</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
            checked={formData.haveChildren}
            onChange={(e) => onChange("haveChildren", e.target.checked)}
          />
          <span className="text-sm text-gray-700">Enfants</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
            checked={formData.availableFamily}
            onChange={(e) => onChange("availableFamily", e.target.checked)}
          />
          <span className="text-sm text-gray-700">Famille d'accueil</span>
        </label>

        {/* Champ conditionnel */}
        {formData.availableFamily && (
          <div className="sm:col-span-2 mt-2">
            <Input
              label="Date de disponibilité"
              type="date"
              value={formData.availableTime ?? ""}
              onChange={(e) => onChange("availableTime", e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}