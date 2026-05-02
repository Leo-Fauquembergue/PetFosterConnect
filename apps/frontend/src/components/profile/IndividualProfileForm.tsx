import type { UpdateUserWithIndividualProfileDto } from "@projet/shared-types";
import Checkbox from "../ui/Checkbox";
import Input from "../ui/Input";
import Select from "../ui/Select";

type Props = {
  formData: Required<Omit<UpdateUserWithIndividualProfileDto, "availableTime">> & {
    availableTime?: string;
  };
  onChange: <K extends keyof Props["formData"]>(field: K, value: Props["formData"][K]) => void;
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

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Type de logement"
          value={formData.housingType || "other"}
          onChange={(e) => onChange("housingType", e.target.value as "house" | "apartment" | "other" | null)}
        >
          <option value="house">Maison</option>
          <option value="apartment">Appartement</option>
          <option value="other">Autre</option>
        </Select>
        <Input
          label="Surface (m²)"
          type="number"
          value={formData.surface || 0}
          onChange={(e) => onChange("surface", Number(e.target.value))}
        />
      </div>

      <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-md">
        <Checkbox
          label="J'ai un jardin clos"
          checked={formData.haveGarden || false}
          onChange={(e) => onChange("haveGarden", e.target.checked)}
        />
        <Checkbox
          label="J'ai d'autres animaux"
          checked={formData.haveAnimals || false}
          onChange={(e) => onChange("haveAnimals", e.target.checked)}
        />
        <Checkbox
          label="J'ai des enfants à charge"
          checked={formData.haveChildren || false}
          onChange={(e) => onChange("haveChildren", e.target.checked)}
        />
      </div>

      <div className="border-t pt-4">
        <Checkbox
          label="Je souhaite devenir Famille d'Accueil"
          checked={formData.availableFamily || false}
          onChange={(e) => onChange("availableFamily", e.target.checked)}
        />
        {formData.availableFamily && (
          <div className="mt-4">
            <Input
              label="Mes disponibilités"
              type="text"
              value={formData.availableTime || ""}
              onChange={(e) => onChange("availableTime", e.target.value)}
              placeholder="Ex: Soir et week-end, télétravail..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
