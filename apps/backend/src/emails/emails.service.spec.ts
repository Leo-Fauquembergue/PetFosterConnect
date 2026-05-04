import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { EmailsService } from "./emails.service";

// On définit le faux comportement complet ici
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: "test-123" }),
  }),
  createTestAccount: jest.fn().mockResolvedValue({
    smtp: { host: "smtp.ethereal.email", port: 587, secure: false },
    user: "test",
    pass: "test",
  }),
  getTestMessageUrl: jest.fn().mockReturnValue("https://fake-ethereal-url.com"),
}));

describe("EmailsService", () => {
  let service: EmailsService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === "FRONTEND_URL") return "http://localhost:5173";
      if (key === "SMTP_HOST") return "smtp.test.com";
      if (key === "SMTP_PORT") return 587;
      if (key === "SMTP_USER") return "test@test.com";
      if (key === "SMTP_PASS") return "password";
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailsService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get<EmailsService>(EmailsService);
  });

  it("doit envoyer un email (simulation)", async () => {
    const result = await service.sendMail("test@test.com", "Sujet", "Message", "<p>HTML</p>");
    expect(result).toEqual({ messageId: "test-123" });
  });
});
