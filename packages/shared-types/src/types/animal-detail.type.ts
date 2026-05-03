import type { AnimalWithRelations } from "../animal-with-relation.schema";

export type AnimalDetailResponse = Omit<AnimalWithRelations, "shelter"> & {
  isBookmarked?: boolean;
  shelter?: {
    id: number;
    pfcUserId: number | null;
    address: string | null;
    shelterProfile?: {
      shelterName: string;
      logo: string | null;
    } | null;
  } | null;
};
