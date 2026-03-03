import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EmailsService } from "./emails.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorators";
import { UserRole } from "@prisma/client";

@ApiTags("emails")
@Controller("emails")
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post("send")
  @UseGuards(JwtAuthGuard, RolesGuard) // 🛡️ SÉCURITÉ : Bloque les bots anonymes
  @Roles(UserRole.admin)               // 🛡️ SÉCURITÉ : Réserve l'usage SMTP aux Admins
  @ApiOperation({ summary: "Envoyer un email" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        to: {
          type: "string",
          example: "destinataire@example.com",
          description: "Adresse email du destinataire",
        },
        subject: {
          type: "string",
          example: "Test d'envoi d'email",
          description: "Sujet de l'email",
        },
        text: {
          type: "string",
          example: "Ceci est un email de test",
          description: "Contenu texte de l'email",
        },
        html: {
          type: "string",
          example: "<p>Ceci est un email de test</p>",
          description: "Contenu HTML de l'email",
        },
      },
      required: ["to", "subject", "text", "html"],
    },
  })
  @ApiResponse({ status: 201, description: "Email envoyé avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({
    status: 500,
    description: "Erreur lors de l'envoi de l'email",
  })
  async sendTestEmail(
    @Body() body: { to: string; subject: string; text: string; html: string }
  ) {
    const result = await this.emailsService.sendMail(
      body.to,
      body.subject,
      body.text,
      body.html
    );

    return { message: "Email envoyé", result };
  }
}