import { RolesGuard } from "./roles.guard";
import { Reflector } from "@nestjs/core";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Partial<Reflector>>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    guard = new RolesGuard(reflector as any);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockContext = (user: any) => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

  it("doit autoriser si aucun rôle n'est requis", () => {
    reflector.getAllAndOverride!.mockReturnValue(undefined);
    expect(guard.canActivate(mockContext({ id: 1 }))).toBe(true);
  });

  it("doit refuser si l'utilisateur n'est pas connecté", () => {
    reflector.getAllAndOverride!.mockReturnValue(["admin"]);
    expect(guard.canActivate(mockContext(undefined))).toBe(false);
  });

  it("doit refuser si l'utilisateur n'a pas le bon rôle", () => {
    reflector.getAllAndOverride!.mockReturnValue(["admin"]);
    expect(guard.canActivate(mockContext({ role: "individual" }))).toBe(false);
  });

  it("doit autoriser si l'utilisateur a le bon rôle", () => {
    reflector.getAllAndOverride!.mockReturnValue(["admin", "shelter"]);
    expect(guard.canActivate(mockContext({ role: "shelter" }))).toBe(true);
  });
});
