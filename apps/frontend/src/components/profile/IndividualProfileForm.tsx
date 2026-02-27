import Input from "../ui/Input";
import Select from "../ui/Select";
import Checkbox from "../ui/Checkbox";

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

      <Select
        label="Type de logement"
        value={formData.housingType}
        onChange={(e) => onChange("housingType", e.target.value)}
      >
        <option value="house">Maison</option>
        <option value="apartment">Appartement</option>
        <option value="other">Autre</option>
      </Select>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <Checkbox
          label="Jardin"
          checked={formData.haveGarden}
          onChange={(e) => onChange("haveGarden", e.target.checked)}
        />
        <Checkbox
          label="Animaux"
          checked={formData.haveAnimals}
          onChange={(e) => onChange("haveAnimals", e.target.checked)}
        />
        <Checkbox
          label="Enfants"
          checked={formData.haveChildren}
          onChange={(e) => onChange("haveChildren", e.target.checked)}
        />
        <Checkbox
          label="Famille d'accueil"
          checked={formData.availableFamily}
          onChange={(e) => onChange("availableFamily", e.target.checked)}
        />

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