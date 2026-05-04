import { ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Request, Response } from "express";
import { COOKIE_NAME } from "../../constants";
import { CsrfMiddleware } from "./csrf.middleware";

describe("CsrfMiddleware", () => {
  let middleware: CsrfMiddleware;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(() => {
    jwtService = {
      verify: jest.fn(),
      // biome-ignore lint/suspicious/noExplicitAny: Simple mock for tests
    } as any;
    configService = {
      get: jest.fn().mockReturnValue("test_secret"),
      // biome-ignore lint/suspicious/noExplicitAny: Simple mock for tests
    } as any;
    middleware = new CsrfMiddleware(jwtService, configService);
  });

  const mockRequest = (
    method: string,
    // biome-ignore lint/suspicious/noExplicitAny: Simple mock for tests
    headers: any = {},
    // biome-ignore lint/suspicious/noExplicitAny: Simple mock for tests
    cookies: any = {}
  ): Partial<Request> => ({
    method,
    headers,
    cookies,
  });

  const mockResponse = (): Partial<Response> => ({});
  const next = jest.fn();

  it("should bypass CSRF if valid Bearer token is present", () => {
    const req = mockRequest("POST", { authorization: "Bearer some-token" });
    middleware.use(req as Request, mockResponse() as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("should NOT bypass CSRF if Bearer token is empty or too short", () => {
    const req = mockRequest("POST", { authorization: "Bearer " });
    // It should proceed to check for cookies/anonymous headers
    // Since both are missing, it should throw (anonymous case)
    expect(() => {
      middleware.use(req as Request, mockResponse() as Response, next);
    }).toThrow(ForbiddenException);
  });

  it("should enforce CSRF check if cookie is present and Bearer is missing", () => {
    const req = mockRequest("POST", {}, { [COOKIE_NAME]: "some-cookie" });
    (jwtService.verify as jest.Mock).mockReturnValue({ csrfToken: "expected-token" });

    // Missing x-csrf-token header
    expect(() => {
      middleware.use(req as Request, mockResponse() as Response, next);
    }).toThrow(ForbiddenException);
  });

  it("should allow request if cookie and x-csrf-token match", () => {
    const req = mockRequest(
      "POST",
      { "x-csrf-token": "valid-token" },
      { [COOKIE_NAME]: "some-cookie" }
    );
    (jwtService.verify as jest.Mock).mockReturnValue({ csrfToken: "valid-token" });

    middleware.use(req as Request, mockResponse() as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("should throw if cookie and x-csrf-token do NOT match", () => {
    const req = mockRequest(
      "POST",
      { "x-csrf-token": "wrong-token" },
      { [COOKIE_NAME]: "some-cookie" }
    );
    (jwtService.verify as jest.Mock).mockReturnValue({ csrfToken: "valid-token" });

    expect(() => {
      middleware.use(req as Request, mockResponse() as Response, next);
    }).toThrow(ForbiddenException);
  });
});
