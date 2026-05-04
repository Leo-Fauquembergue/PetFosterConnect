import type { AnimalWithRelations } from "../animal-with-relation.schema";
import type { ApplicationStatus } from "../application.schema";

export type AnimalDetailResponse = Omit<AnimalWithRelations, "shelter"> & {
  isBookmarked?: boolean;
  myApplicationStatus?: ApplicationStatus | null;
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
