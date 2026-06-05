import * as z from "zod";

export const registerSchema = z.object({
	username: z.string().min(1, "Username is required"),
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(20, "Password must be at most 20 characters")
		.refine((val) => /[A-Z]/.test(val), { message: "Password must include an uppercase letter" })
		.refine((val) => /[a-z]/.test(val), { message: "Password must include a lowercase letter" })
		.refine((val) => /\d/.test(val), { message: "Password must include a number" })
		.refine((val) => /[!@#$%^&*]/.test(val), { message: "Password must include a special character" }),
	role: z.enum(["admin", "member"]),
	company: z.string().min(1, "Company is required"),
	job_title: z.string().min(1, "Job title is required"),
	department: z.string().min(1, "Department is required"),
});
