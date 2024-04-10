import zod  from "zod"

export const emailSchema=zod.string().email();
export const nameSchema= zod.string().max(30)
export const descriptionSchema = zod.string().max(500)
export const usernameSchema = zod.string().max(20);
export const passwordSchema = zod.string().min(6);
export const otpSchema = zod.string().min(4).max(4)