import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ZodType } from "zod";

@Injectable()
export class ZodPipe implements PipeTransform {
  // On type le constructeur avec ZodType
  constructor(private schema: ZodType) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    // Si ce n'est pas le body, on laisse passer sans valider
    if (metadata.type !== "body") {
      return value;
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
}
