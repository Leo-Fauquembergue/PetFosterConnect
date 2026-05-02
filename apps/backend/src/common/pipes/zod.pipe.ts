import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ZodType } from "zod";

@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    // Si query ou param, on tente de transformer les chaînes numériques en nombres
    // avant la validation si le schéma Zod l'attend.
    if (metadata.type === "query" || metadata.type === "param") {
      value = this.transformValues(value);
    }

    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException({
        message: "Validation failed",
        errors: error,
      });
    }
  }

  private transformValues(value: unknown): unknown {
    if (typeof value === "string") {
      const number = Number(value);
      if (!Number.isNaN(number)) {
        return number;
      }
    }
    if (typeof value === "object" && value !== null) {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, this.transformValues(v)])
      );
    }
    return value;
  }
}
