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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailsService],
    }).compile();

    service = module.get<EmailsService>(EmailsService);
  });

  it("doit envoyer un email (simulation)", async () => {
    const result = await service.sendMail("test@test.com", "Sujet", "Message", "<p>HTML</p>");
    expect(result).toEqual({ messageId: "test-123" });
  });
});
