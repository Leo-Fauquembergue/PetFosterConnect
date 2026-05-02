import * as fs from "node:fs";
import * as path from "node:path";
import { Injectable, Logger } from "@nestjs/common";
import * as handlebars from "handlebars";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailsService {
  private transporter;
  private readonly logger = new Logger(EmailsService.name);
  private readonly baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  private readonly templatesDir = path.join(__dirname, "templates");
  private readonly templateCache: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor() {
    // ... (transporter config remains same)
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      this.logger.log("📧 Configuration SMTP chargée depuis .env");
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
    const info = await this.transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    this.logger.log(`✅ Email envoyé, Message ID: ${info.messageId}`);
    return info;
  }

  // -------------------------------
  // Moteur de Template (Handlebars)
  // -------------------------------

  private getTemplate(name: string): handlebars.TemplateDelegate {
    if (this.templateCache.has(name)) {
      return this.templateCache.get(name)!;
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

  private compileTemplate(templateName: string, data: any): string {
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

  // -------------------------------
  // Méthodes publiques
  // -------------------------------

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
