import { Test, TestingModule } from '@nestjs/testing';
import { EmailsService } from './emails.service';

// On définit le faux comportement ici
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    // On simule la fonction sendMail qui répond "OK" tout de suite
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-123' }),
  }),
  getTestMessageUrl: jest.fn().mockReturnValue('https://fake-ethereal-url.com'),
}));

describe('EmailsService', () => {
  let service: EmailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailsService],
    }).compile();

    service = module.get<EmailsService>(EmailsService);
  });

  it('doit envoyer un email (simulation)', async () => {
    // On exécute la fonction normalement
    const result = await service.sendMail('test@test.com', 'Sujet', 'Message', '<p>HTML</p>');

    // On vérifie juste qu'on a reçu la fausse réponse définie plus haut
    expect(result).toEqual({ messageId: 'test-123' });
  });
});