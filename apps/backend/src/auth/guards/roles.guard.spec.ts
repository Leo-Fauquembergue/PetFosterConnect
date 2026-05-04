import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  const mockContext = (user: unknown) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  it("doit autoriser si aucun rôle n'est requis", () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    expect(guard.canActivate(mockContext({ id: 1 }))).toBe(true);
  });

  it("doit refuser si l'utilisateur n'est pas connecté", () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(["admin"]);
    expect(guard.canActivate(mockContext(undefined))).toBe(false);
  });

  it("doit refuser si l'utilisateur n'a pas le bon rôle", () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(["admin"]);
    expect(guard.canActivate(mockContext({ role: "individual" }))).toBe(false);
  });

  it("doit autoriser si l'utilisateur a le bon rôle", () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(["admin", "shelter"]);
    expect(guard.canActivate(mockContext({ role: "shelter" }))).toBe(true);
  });
});
