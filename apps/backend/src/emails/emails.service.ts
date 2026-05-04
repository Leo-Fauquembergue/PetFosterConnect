import * as fs from "node:fs";
import * as path from "node:path";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as handlebars from "handlebars";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailsService {
  private transporter;
  private readonly logger = new Logger(EmailsService.name);
  private readonly baseUrl: string;
  private readonly templatesDir = path.join(__dirname, "templates");
  private readonly templateCache: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>("FRONTEND_URL") || "http://localhost:5173";

    const smtpHost = this.configService.get<string>("SMTP_HOST");

    if (smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.configService.get<number>("SMTP_PORT"),
        secure: false,
        auth: {
          user: this.configService.get<string>("SMTP_USER"),
          pass: this.configService.get<string>("SMTP_PASS"),
        },
      });
      this.logger.log("📧 Configuration SMTP chargée depuis ConfigService");
    } else {
      this.logger.log("👻 Pas de config SMTP détectée, création d'un compte Ethereal...");
      nodemailer.createTestAccount().then((account) => {
        this.transporter = nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: { user: account.user, pass: account.pass },
        });
        this.logger.log(`✨ Prêt ! Les emails seront visibles sur : https://ethereal.email/login`);
      });
    }
  }

  async sendMail(to: string, subject: string, text: string, html: string) {
    this.logger.log(`📨 Envoi d’un mail à : ${to}`);
    const from =
      this.configService.get<string>("SMTP_FROM") || this.configService.get<string>("SMTP_USER");

    const info = await this.transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    this.logger.log(`✅ Email envoyé, Message ID: ${info.messageId}`);
    return info;
  }

  // Moteur de template (Handlebars).

  private getTemplate(name: string): handlebars.TemplateDelegate {
    const cachedTemplate = this.templateCache.get(name);
    if (cachedTemplate) {
      return cachedTemplate;
    }

    const filePath = path.join(this.templatesDir, `${name}.hbs`);
    if (!fs.existsSync(filePath)) {
      this.logger.error(`❌ Template manquant: ${filePath}`);
      throw new Error(`Template ${name} introuvable`);
    }

    const source = fs.readFileSync(filePath, "utf-8");
    const template = handlebars.compile(source);
    this.templateCache.set(name, template);
    return template;
  }

  private compileTemplate(templateName: string, data: Record<string, unknown>): string {
    try {
      const layout = this.getTemplate("layout");
      const template = this.getTemplate(templateName);

      // Injection du contenu spécifique dans le layout
      const body = template({ ...data, baseUrl: this.baseUrl });
      return layout({ body });
    } catch (error) {
      this.logger.error(`💥 Erreur compilation template ${templateName}:`, error);
      throw error;
    }
  }

  // Méthodes publiques.

  async sendAcceptanceEmail(to: string, firstname: string, animalName: string) {
    const html = this.compileTemplate("acceptance", { firstname, animalName });
    return this.sendMail(
      to,
      "Votre candidature a été acceptée",
      "Félicitations, votre demande a été validée !",
      html
    );
  }

  async sendRejectionEmail(to: string, firstname: string, animalName: string) {
    const html = this.compileTemplate("rejection", { firstname, animalName });
    return this.sendMail(
      to,
      "Votre candidature a été refusée",
      "Nous sommes désolés, votre demande n’a pas été retenue.",
      html
    );
  }
}
