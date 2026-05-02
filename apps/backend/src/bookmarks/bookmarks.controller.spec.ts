import { Test, type TestingModule } from "@nestjs/testing";
import type { RequestWithUser } from "@projet/shared-types";
import { BookmarksController } from "./bookmarks.controller";
import { BookmarksService } from "./bookmarks.service";

describe("BookmarksController", () => {
  let controller: BookmarksController;
  let service: BookmarksService;

  const mockBookmarksService = {
    toggle: jest.fn(),
    findAllByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarksController],
      providers: [
        {
          provide: BookmarksService,
          useValue: mockBookmarksService,
        },
      ],
    }).compile();

    controller = module.get<BookmarksController>(BookmarksController);
    service = module.get<BookmarksService>(BookmarksService);
  });

  it("devrait être défini", () => {
    expect(controller).toBeDefined();
  });

  it("devrait appeler toggle avec les bonnes informations", async () => {
    const req = {
      user: { id: 1, role: "individual", email: "user@test.com" },
    } as RequestWithUser;
    const dto = { animalId: 10 };
    const expectedResult = { bookmarked: true };
    mockBookmarksService.toggle.mockResolvedValue(expectedResult);

    const result = await controller.toggle(req, dto);

    expect(service.toggle).toHaveBeenCalledWith(1, 10);
    expect(result).toEqual(expectedResult);
  });

  it("devrait appeler findAllByUser avec le bon ID utilisateur", async () => {
    const req = {
      user: { id: 1, role: "individual", email: "user@test.com" },
    } as RequestWithUser;
    const expectedResult: any[] = [];
    mockBookmarksService.findAllByUser.mockResolvedValue(expectedResult);

    const result = await controller.getMyBookmarks(req);

    expect(service.findAllByUser).toHaveBeenCalledWith(1);
    expect(result).toEqual(expectedResult);
  });
});
