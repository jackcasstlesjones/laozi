import { z } from "zod"

export const MIN_PASSWORD = 12

export const changePasswordInput = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(
        MIN_PASSWORD,
        `New password must be at least ${MIN_PASSWORD} characters`
      ),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
  })
