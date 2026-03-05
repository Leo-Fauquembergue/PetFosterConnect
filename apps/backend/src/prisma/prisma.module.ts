/**
 * ============================================================================
 * 📦 PRISMA MODULE
 * ============================================================================
 * Ce module enveloppe le PrismaService pour le rendre disponible ailleurs.
 * * L'utilisation de @Global() est une exception ici : elle permet d'injecter
 * PrismaService dans n'importe quel autre module (User, Animal, etc.)
 * sans avoir à ré-importer PrismaModule à chaque fois.
 * ============================================================================
 */

import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
