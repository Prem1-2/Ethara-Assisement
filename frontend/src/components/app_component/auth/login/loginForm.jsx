"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { User, ShieldCheck, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";

export function LoginForm({ className, ...props }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		password: "",
	});
	const [role, setRole] = useState("member");
	const [error, setError] = useState("");

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.id]: e.target.value,
		});
	};

	const executeLogin = async (payload) => {
		setIsLoading(true);
		setError("");

		try {
			router.refresh();
			const res = await axiosInstance.post("/auth/login", payload);

			const user = res.data.user;
			const userRole = user.role;

			if (userRole === "member") {
				toast.success(`redirecting to ${userRole} dashboard`);
				router.refresh();

				localStorage.setItem(
					"user",
					JSON.stringify({
						name: user.full_name,
						username: user.username,
						email: user.email,
						role: user.role,
						joined: user.createdAt,
					}),
				);

				setTimeout(() => router.push("/member/dashboard"), 1000);
			}

			if (userRole === "admin") {
				toast.success(`redirecting to ${userRole} dashboard`);
				router.refresh();

				localStorage.setItem(
					"user",
					JSON.stringify({
						userId: user.id,
						name: user.full_name,
						username: user.username,
						email: user.email,
						role: user.role,
						joined: user.joined,
					}),
				);

				setTimeout(() => router.push("/admin/dashboard"), 1000);
			}
		} catch (error) {
			console.error("Login client error:", error);
			const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Login failed. Please try again.";
			setError(errorMsg);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const payload = {
			...(formData.email ? { email: formData.email } : { username: formData.username }),
			password: formData.password,
			role: role,
		};
		await executeLogin(payload);
	};

	const handleDemoLogin = async (demoRole) => {
		const demoEmail = demoRole === "admin" ? "saurabhkumar.poly123@gmail.com" : "2301731114@krmu.edu.in";
		const demoPassword = "Test@1234";
		
		setFormData({
			email: demoEmail,
			username: "",
			password: demoPassword,
		});
		setRole(demoRole);
		
		await executeLogin({
			email: demoEmail,
			password: demoPassword,
			role: demoRole,
		});
	};

	return (
		<div
			className={cn("flex flex-col gap-6 animate-fade-in-up", className)}
			{...props}
		>
			<Card className='card-premium overflow-hidden p-0'>
				<CardContent className='grid p-0 md:grid-cols-2'>
					<form className='p-8 md:p-10' onSubmit={handleSubmit}>
						<FieldGroup className='gap-6'>
							<div className='flex flex-col gap-3 text-center'>
								<div className='flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-2'>
									<span className='text-xl font-bold text-primary'>E</span>
								</div>
								<h1 className='text-3xl font-bold tracking-tight'>Ethara AI</h1>
								<p className='text-balance text-muted-foreground text-sm'>
									Sign in to access LLM post-training workflows
								</p>
							</div>

							{error && (
								<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-shake">
									<div className="size-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
										<AlertTriangle className="size-4 text-red-500" />
									</div>
									<p className="text-xs font-bold text-red-600 leading-tight">{error}</p>
								</div>
							)}

							<div className="relative my-2">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t border-border/40" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background px-4 text-muted-foreground font-black tracking-widest">
										Demo Access
									</span>
								</div>
							</div>
							
							<div className="grid grid-cols-2 gap-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => handleDemoLogin("member")}
									disabled={isLoading}
									className="rounded-xl border-border/40 hover:bg-primary/5 hover:text-primary transition-all font-semibold h-11"
								>
									Member
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => handleDemoLogin("admin")}
									disabled={isLoading}
									className="rounded-xl border-border/40 hover:bg-primary/5 hover:text-primary transition-all font-semibold h-11"
								>
									Admin
								</Button>
							</div>

							<div className='space-y-4'>
								<Field>
									<FieldLabel className='text-sm font-semibold mb-2'>
										Login As
									</FieldLabel>
									<Select value={role} onValueChange={setRole}>
										<SelectTrigger className='h-12 rounded-xl border-border/50 bg-background/50'>
											<div className='flex items-center gap-3'>
												<div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
													{role === "admin" ?
														<ShieldCheck className='w-4 h-4 text-primary' />
													:	<User className='w-4 h-4 text-primary' />
													}
												</div>
												<SelectValue placeholder='Select Role' />
											</div>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='member'>User / Annotator</SelectItem>
											<SelectItem value='admin'>Administrator</SelectItem>
										</SelectContent>
									</Select>
								</Field>

								<div className='flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10 transition-all'>
									<div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1'>
										{role === "admin" ?
											<ShieldCheck className='w-5 h-5 text-primary' />
										:	<User className='w-5 h-5 text-primary' />
										}
									</div>
									<div className='space-y-1'>
										<p className='font-bold text-sm text-foreground'>
											You are logging in as a {role === "admin" ? "Admin" : "User"}
										</p>
										<p className='text-xs text-muted-foreground leading-relaxed'>
											{role === "admin" ?
												"Access administrative tools, user management, and system settings."
											:	"Access your annotation tasks, projects, and workflow dashboards."}
										</p>
									</div>
								</div>

								<Field>
									<FieldLabel htmlFor='email' className='text-sm font-semibold'>
										<div className='flex items-center gap-2 mb-1.5'>
											<Mail className='w-3.5 h-3.5 text-muted-foreground' />
											<span>Email Address</span>
										</div>
									</FieldLabel>
									<Input
										id='email'
										type='email'
										placeholder='your.email@company.com'
										required
										className='input-focus h-10 rounded-lg'
										autoComplete='email'
										value={formData.email}
										onChange={handleChange}
									/>
									<FieldDescription className='text-xs'>
										Your organizational email address
									</FieldDescription>
								</Field>

								<Field>
									<div className='flex items-center justify-between'>
										<FieldLabel
											htmlFor='password'
											className='text-sm font-semibold'
										>
											<div className='flex items-center gap-2 mb-1.5'>
												<Lock className='w-3.5 h-3.5 text-muted-foreground' />
												<span>Password</span>
											</div>
										</FieldLabel>
										<Link
											href='#'
											className='text-xs font-medium text-primary hover:text-primary/80 transition-colors'
										>
											Reset password
										</Link>
									</div>
									<div className='relative'>
										<Input
											id='password'
											type={showPassword ? "text" : "password"}
											placeholder='Enter your password'
											required
											className='input-focus h-10 rounded-lg pr-10'
											autoComplete='current-password'
											value={formData.password}
											onChange={handleChange}
										/>
										<button
											type='button'
											onClick={() => setShowPassword(!showPassword)}
											className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
											tabIndex={-1}
										>
											{showPassword ?
												<svg
													className='w-4 h-4'
													fill='none'
													stroke='currentColor'
													viewBox='0 0 24 24'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
													/>
												</svg>
											:	<svg
													className='w-4 h-4'
													fill='none'
													stroke='currentColor'
													viewBox='0 0 24 24'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
													/>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
													/>
												</svg>
											}
										</button>
									</div>
								</Field>
							</div>

							<Field>
								<Button
									type='submit'
									className='btn-primary w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20'
									disabled={isLoading}
								>
									{isLoading ?
										<span className='flex items-center gap-2'>
											<svg
												className='w-5 h-5 animate-spin'
												fill='none'
												viewBox='0 0 24 24'
											>
												<circle
													className='opacity-25'
													cx='12'
													cy='12'
													r='10'
													stroke='currentColor'
													strokeWidth='4'
												/>
												<path
													className='opacity-75'
													fill='currentColor'
													d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
												/>
											</svg>
											Signing in...
										</span>
									:	<span className='flex items-center gap-2'>
											<Lock className='w-4 h-4' />
											Sign In
										</span>
									}
								</Button>
							</Field>

							<div className='flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary/5 border border-primary/10'>
								<CheckCircle2 className='w-4 h-4 text-primary' />
								<p className='text-xs font-semibold text-primary/80'>
									Access Type: <span className='text-primary'>{role === "admin" ? "Admin Panel" : "User Workspace"}</span>
								</p>
							</div>

							<FieldDescription className='text-center text-xs pt-1'>
								{role === "admin" ?
									<>
										Need admin access?{" "}
										<Link
											href='/auth/admin-signup'
											className='font-bold text-primary hover:underline transition-all'
										>
											Create Admin Account
										</Link>
									</>
								:	<>
										Don't have an account?{" "}
										<Link
											href='/auth/signup'
											className='font-bold text-primary hover:underline transition-all'
										>
											Sign Up
										</Link>
									</>
								}
							</FieldDescription>
						</FieldGroup>
					</form>

					<div className='relative hidden md:flex flex-col justify-between bg-gradient-to-br from-primary/8 to-accent/5 p-10'>
						<div className='absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-accent/8' />
						<div className='relative z-10'>
							<div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/25 mb-6'>
								<span className='w-2 h-2 bg-primary rounded-full animate-pulse' />
								<span className='text-xs font-medium text-primary'>
									Research-Driven AI
								</span>
							</div>
							<h2 className='text-3xl font-bold text-foreground leading-tight mb-3'>
								Post-training Intelligence
							</h2>
							<p className='text-muted-foreground text-sm leading-relaxed'>
								Advanced LLM evaluation, data operations, and reinforcement
								learning from human feedback
							</p>
						</div>

						<div className='relative z-10 space-y-3'>
							<div className='flex gap-3 p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-white/20'>
								<div className='w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0'>
									<svg
										className='w-5 h-5 text-primary'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
										/>
									</svg>
								</div>
								<div>
									<p className='font-medium text-foreground text-sm'>
										Data Quality
									</p>
									<p className='text-muted-foreground text-xs'>
										Precision annotation & curation
									</p>
								</div>
							</div>
							<div className='flex gap-3 p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-white/20'>
								<div className='w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0'>
									<svg
										className='w-5 h-5 text-primary'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M13 10V3L4 14h7v7l9-11h-7z'
										/>
									</svg>
								</div>
								<div>
									<p className='font-medium text-foreground text-sm'>
										RLHF & SFT
									</p>
									<p className='text-muted-foreground text-xs'>
										Specialized model training
									</p>
								</div>
							</div>
							<div className='flex gap-3 p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-white/20'>
								<div className='w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0'>
									<svg
										className='w-5 h-5 text-primary'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
										/>
									</svg>
								</div>
								<div>
									<p className='font-medium text-foreground text-sm'>
										Safety & Alignment
									</p>
									<p className='text-muted-foreground text-xs'>
										Responsible AI practices
									</p>
								</div>
							</div>
						</div>

						<div className='relative z-10 pt-4 border-t border-border/30'>
							<p className='text-xs text-muted-foreground'>
								Trusted by frontier AI teams. Enterprise-grade{" "}
								<span className='font-semibold text-foreground'>
									data operations
								</span>{" "}
								and{" "}
								<span className='font-semibold text-foreground'>
									model evaluation
								</span>
								.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<FieldDescription className='px-6 text-center text-xs text-muted-foreground'>
				By signing in, you agree to our{" "}
				<Link
					href='#'
					className='font-medium text-foreground hover:text-primary transition-colors'
				>
					Terms of Service
				</Link>{" "}
				and{" "}
				<Link
					href='#'
					className='font-medium text-foreground hover:text-primary transition-colors'
				>
					Privacy Policy
				</Link>
			</FieldDescription>
		</div>
	);
}
