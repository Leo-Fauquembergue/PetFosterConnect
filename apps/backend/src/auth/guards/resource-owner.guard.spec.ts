import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { ResourceOwnerGuard } from "./resource-owner.guard";

describe("ResourceOwnerGuard", () => {
  let guard: ResourceOwnerGuard;
  let reflector: jest.Mocked<Reflector>;
  let prisma: {
    animal: { findUnique: jest.Mock };
    pfcUser: { findUnique: jest.Mock };
  };

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    prisma = {
      animal: { findUnique: jest.fn() },
      pfcUser: { findUnique: jest.fn() },
    };
    guard = new ResourceOwnerGuard(reflector, prisma as unknown as PrismaService);
  });

  const mockContext = (user: unknown, params: unknown) =>
    ({
      getHandler: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user, params }),
      }),
    }) as unknown as ExecutionContext;

  it("doit autoriser l'accès si aucun décorateur n'est présent", async () => {
    (reflector.get as jest.Mock).mockReturnValue(undefined);
    const result = await guard.canActivate(mockContext({ id: 1 }, {}));
    expect(result).toBe(true);
  });

  it("doit refuser l'accès si l'utilisateur n'est pas authentifié", async () => {
    (reflector.get as jest.Mock).mockReturnValue({ type: "animal", idParam: "id" });
    await expect(guard.canActivate(mockContext(undefined, { id: 1 }))).rejects.toThrow(
      ForbiddenException
    );
  });

  it("doit autoriser l'accès directement pour un admin", async () => {
    (reflector.get as jest.Mock).mockReturnValue({ type: "animal", idParam: "id" });
    const result = await guard.canActivate(mockContext({ id: 1, role: "admin" }, { id: 1 }));
    expect(result).toBe(true);
    expect(prisma.animal.findUnique).not.toHaveBeenCalled();
  });

  it("doit lever BadRequest si l'ID est malformé", async () => {
    (reflector.get as jest.Mock).mockReturnValue({ type: "animal", idParam: "id" });
    await expect(
      guard.canActivate(mockContext({ id: 1, role: "individual" }, { id: "abc" }))
    ).rejects.toThrow(BadRequestException);
  });

  it("doit lever NotFound si la ressource n'existe pas", async () => {
    (reflector.get as jest.Mock).mockReturnValue({ type: "animal", idParam: "id" });
    (prisma.animal.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(
      guard.canActivate(mockContext({ id: 1, role: "individual" }, { id: "2" }))
    ).rejects.toThrow(NotFoundException);
  });

  it("doit autoriser l'accès si l'utilisateur est propriétaire (animal)", async () => {
    (reflector.get as jest.Mock).mockReturnValue({ type: "animal", idParam: "id" });
    (prisma.animal.findUnique as jest.Mock).mockResolvedValue({ pfcUserId: 5, deletedAt: null });
    const result = await guard.canActivate(mockContext({ id: 5, role: "shelter" }, { id: "2" }));
    expect(result).toBe(true);
  });

  it("doit refuser l'accès si l'utilisateur n'est pas propriétaire", async () => {
    (reflector.get as jest.Mock).mockReturnValue({ type: "animal", idParam: "id" });
    (prisma.animal.findUnique as jest.Mock).mockResolvedValue({ pfcUserId: 10, deletedAt: null });
    await expect(
      guard.canActivate(mockContext({ id: 5, role: "shelter" }, { id: "2" }))
    ).rejects.toThrow(ForbiddenException);
  });
});
