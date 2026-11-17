import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(2, "Mínimo 2 caracteres")
  .max(30, "Máximo 30 caracteres")
  .regex(/^[\p{L}0-9 ._-]+$/u, "Usá letras, números, espacios, puntos o guiones");

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Mínimo 2 caracteres")
  .max(60, "Máximo 60 caracteres")
  .regex(/^[\p{L} .'-]+$/u, "Usá letras y espacios");

export const aliasSchema = z
  .string()
  .trim()
  .min(2, "Mínimo 2 caracteres")
  .max(40, "Máximo 40 caracteres")
  .regex(/^[a-zA-Z0-9._-]+$/, "Usá letras, números, puntos, guiones o guiones bajos, sin espacios");

export const pinSchema = z
  .string()
  .regex(/^\d{4,6}$/, "El PIN debe tener de 4 a 6 dígitos");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Poné un mail válido")
  .max(254, "Máximo 254 caracteres");

export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72, "Máximo 72 caracteres");

export const birthdaySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
  .refine((value) => {
    const date = new Date(value + "T00:00:00Z");
    if (Number.isNaN(date.getTime())) return false;
    const now = new Date();
    const minYear = now.getUTCFullYear() - 120;
    return date.getUTCFullYear() >= minYear && date.getTime() <= now.getTime();
  }, "Tiene que ser una fecha real, no futura");

export const emailLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema.optional(),
  fullName: fullNameSchema.optional(),
  alias: aliasSchema.optional(),
  birthday: birthdaySchema.optional(),
});

export const migrateLegacySchema = z.object({
  username: usernameSchema,
  pin: pinSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  token: z.string().min(1, "Falta el token"),
  password: passwordSchema,
});
