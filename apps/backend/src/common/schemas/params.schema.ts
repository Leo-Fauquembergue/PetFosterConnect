import { z } from "zod";

export const LimitSchema = z.coerce.number().int().min(1).max(50).default(50);
export const IdSchema = z.coerce.number().int().positive();
