import * as z from "zod";

export const loginSchema = z.union([
	z.object({
		email: z.string().email("Invalid email"),
		password: z.string().min(1, "Password is required"),
		role: z.string().optional(),
	}),
	z.object({
		username: z.string().min(1).max(20),
		password: z.string().min(1, "Password is required"),
		role: z.string().optional(),
	}),
]);

export const verifyEmailSchema = z.object({
	token: z.string().min(1).max(200),
});
