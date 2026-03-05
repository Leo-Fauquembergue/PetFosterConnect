import type { RequestWithUser } from "@projet/shared-types";
import { BookmarksController } from "./bookmarks.controller";
import { BookmarksService } from "./bookmarks.service";

// On empêche NestJS d'exécuter les décorateurs qui font planter Jest
jest.mock("@nestjs/common", () => ({
  ...jest.requireActual("@nestjs/common"),
  Post: () => jest.fn(),
  Get: () => jest.fn(),
  Body: () => jest.fn(),
  Req: () => jest.fn(),
  UsePipes: () => jest.fn(),
  UseGuards: () => jest.fn(),
  Controller: () => jest.fn(),
}));

describe("BookmarksController", () => {
  let controller: BookmarksController;
  let mockService: Partial<BookmarksService>;

  beforeEach(() => {
    // On simule le service avec le typage Partial
    mockService = {
      toggle: jest.fn().mockResolvedValue({ bookmarked: true }),
      findAllByUser: jest.fn().mockResolvedValue([]),
    };

    // Instanciation manuelle
    controller = new BookmarksController(mockService as BookmarksService);
  });

  it("devrait appeler toggle avec les bonnes informations", async () => {
    const req = {
      user: { id: 1, role: "individual", email: "user@test.com" },
    } as Partial<RequestWithUser>;
    const dto = { animalId: 10 };

    const result = await controller.toggle(req as RequestWithUser, dto);

    expect(mockService.toggle).toHaveBeenCalledWith(1, 10);
    expect(result).toEqual({ bookmarked: true });
  });

  it("devrait appeler findAllByUser avec le bon ID utilisateur", async () => {
    const req = {
      user: { id: 1, role: "individual", email: "user@test.com" },
    } as Partial<RequestWithUser>;

    const result = await controller.getMyBookmarks(req as RequestWithUser);

    expect(mockService.findAllByUser).toHaveBeenCalledWith(1);
    expect(result).toEqual([]);
  });
});
