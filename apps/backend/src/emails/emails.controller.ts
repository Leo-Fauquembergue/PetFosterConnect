import { Body, Controller, Post, UseGuards, UsePipes } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { Roles } from "../auth/decorators/roles.decorators";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ZodPipe } from "../common/pipes/zod.pipe";
import { EmailsService } from "./emails.service";

const SendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  text: z.string().min(1),
  html: z.string().min(1),
});

@ApiTags("emails")
@Controller("emails")
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post("send")
  @UseGuards(JwtAuthGuard, RolesGuard) // 🛡️ SÉCURITÉ : Bloque les bots anonymes
  @Roles(UserRole.admin) // 🛡️ SÉCURITÉ : Réserve l'usage SMTP aux Admins
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
  @UsePipes(new ZodPipe(SendEmailSchema))
  async sendTestEmail(@Body() body: { to: string; subject: string; text: string; html: string }) {
    const result = await this.emailsService.sendMail(body.to, body.subject, body.text, body.html);

    return { message: "Email envoyé", result };
  }
}
