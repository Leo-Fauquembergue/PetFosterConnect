import { ConfigService } from "@nestjs/config";
import { COOKIE_NAME } from "../../constants";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let prisma: PrismaService;
  let configService: ConfigService;

  beforeEach(() => {
    prisma = {
      pfcUser: {
        findUnique: jest.fn(),
      },
      // biome-ignore lint/suspicious/noExplicitAny: Simple mock for tests
    } as any;
    configService = {
      get: jest.fn().mockReturnValue("test_secret"),
      // biome-ignore lint/suspicious/noExplicitAny: Simple mock for tests
    } as any;
    strategy = new JwtStrategy(configService, prisma);
  });

  describe("jwtFromRequest", () => {
    it("should prioritize Bearer token over Cookie", () => {
      // Accessing private property for testing purposes
      // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
      const jwtFromRequest = (strategy as any)._jwtFromRequest;

      const req = {
        headers: {
          authorization: "Bearer bearer-token",
        },
        cookies: {
          [COOKIE_NAME]: "cookie-token",
        },
      };

      const token = jwtFromRequest(req);
      expect(token).toBe("bearer-token");
    });

    it("should fall back to Cookie if Bearer token is missing", () => {
      // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
      const jwtFromRequest = (strategy as any)._jwtFromRequest;

      const req = {
        headers: {},
        cookies: {
          [COOKIE_NAME]: "cookie-token",
        },
      };

      const token = jwtFromRequest(req);
      expect(token).toBe("cookie-token");
    });
  });
});
