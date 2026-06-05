"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
	User, 
	ShieldCheck, 
	Mail, 
	Lock, 
	Briefcase, 
	Building2, 
	ArrowRight, 
	AtSign, 
	ChevronRight,
	CheckCircle2
} from "lucide-react";

export function SignupForm({ role = "member", className, ...props }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		username: "",
		name: "",
		email: "",
		password: "",
		company: "",
		job_title: "",
		department: "",
	});

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.id]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const payload = { ...formData, role };
			await axiosInstance.post("/auth/register", payload);
			
			toast.success("Account created successfully!");
			toast.info("Please login to access your dashboard.");
			
			setTimeout(() => router.push("/auth/login"), 2000);
		} catch (error) {
			const msg = error.response?.data?.errors || error.response?.data?.message || "Registration failed";
			toast.error(msg);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6 animate-fade-in-up", className)} {...props}>
			<Card className='card-premium overflow-hidden p-0 border-border/50 shadow-2xl'>
				<CardContent className='grid p-0 md:grid-cols-12 min-h-[600px]'>
					{/* Left: Branding & Info */}
					<div className='hidden md:flex md:col-span-4 flex-col justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 border-r border-border/10'>
						<div className="space-y-6">
							<div className='flex items-center gap-3'>
								<div className='flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20'>
									E
								</div>
								<h2 className="text-xl font-black tracking-tighter">Ethara AI</h2>
							</div>

							<div className="space-y-4 pt-10">
								<h1 className="text-3xl font-black leading-tight">
									Start your <span className="text-primary">Journey</span> with us.
								</h1>
								<p className="text-sm text-muted-foreground font-medium leading-relaxed">
									Join thousands of professionals optimizing AI workflows with our cutting-edge post-training platform.
								</p>
							</div>

							<div className="space-y-3 pt-6">
								{[
									"Collaborative Workspaces",
									"Advanced Analytics",
									"Enterprise Security"
								].map((item, i) => (
									<div key={i} className="flex items-center gap-2">
										<CheckCircle2 className="size-4 text-primary" />
										<span className="text-xs font-bold text-foreground/80">{item}</span>
									</div>
								))}
							</div>
						</div>

						<div className="pt-10 border-t border-border/10">
							<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Secure & Encrypted</p>
						</div>
					</div>

					{/* Right: Signup Form */}
					<form className='p-8 md:p-12 md:col-span-8 flex flex-col' onSubmit={handleSubmit}>
						<div className='flex flex-col gap-2 mb-8'>
							<div className="flex items-center gap-2">
								<h2 className='text-2xl font-black tracking-tight uppercase'>Create {role === 'admin' ? 'Admin' : 'User'} Account</h2>
								<div className={cn(
									"px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
									role === 'admin' ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
								)}>
									{role}
								</div>
							</div>
							<p className='text-muted-foreground text-sm font-medium'>
								Enter your details to register on the platform
							</p>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className="space-y-1.5">
								<label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1" htmlFor="name">Full Name</label>
								<div className="relative">
									<User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
									<Input id='name' placeholder='Saurabh Kumar' required className='h-11 pl-10 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all shadow-sm' value={formData.name} onChange={handleChange} />
								</div>
							</div>

							<div className="space-y-1.5">
								<label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1" htmlFor="username">Username</label>
								<div className="relative">
									<AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
									<Input id='username' placeholder='saurabh_ai' required className='h-11 pl-10 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all shadow-sm' value={formData.username} onChange={handleChange} />
								</div>
							</div>

							<div className="space-y-1.5 md:col-span-2">
								<label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1" htmlFor="email">Email Address</label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
									<Input id='email' type='email' placeholder='name@company.com' required className='h-11 pl-10 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all shadow-sm' value={formData.email} onChange={handleChange} />
								</div>
							</div>

							<div className="space-y-1.5 md:col-span-2">
								<label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1" htmlFor="password">Security Password</label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
									<Input id='password' type='password' placeholder='••••••••' required className='h-11 pl-10 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all shadow-sm' value={formData.password} onChange={handleChange} />
								</div>
								<p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider ml-1">Must be 6+ characters with Upper, Lower, Number & Symbol</p>
							</div>

							<div className="space-y-1.5">
								<label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1" htmlFor="company">Organization</label>
								<div className="relative">
									<Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
									<Input id='company' placeholder='Ethara AI' required className='h-11 pl-10 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all shadow-sm' value={formData.company} onChange={handleChange} />
								</div>
							</div>

							<div className="space-y-1.5">
								<label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1" htmlFor="department">Department</label>
								<div className="relative">
									<Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
									<Input id='department' placeholder='Engineering' required className='h-11 pl-10 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all shadow-sm' value={formData.department} onChange={handleChange} />
								</div>
							</div>

							<div className="space-y-1.5 md:col-span-2">
								<label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1" htmlFor="job_title">Job Title</label>
								<div className="relative">
									<ArrowRight className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
									<Input id='job_title' placeholder='Lead AI Researcher' required className='h-11 pl-10 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all shadow-sm' value={formData.job_title} onChange={handleChange} />
								</div>
							</div>
						</div>

						<div className='mt-10 space-y-4'>
							<Button type='submit' className='w-full h-12 rounded-xl font-black text-base shadow-xl shadow-primary/20 group' disabled={isLoading}>
								{isLoading ? (
									<span className='flex items-center gap-2'>
										<div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										Processing...
									</span>
								) : (
									<span className='flex items-center gap-2'>
										Register Account <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
									</span>
								)}
							</Button>
							
							<p className='text-center text-xs font-bold text-muted-foreground'>
								Already have an account?{" "}
								<Link href='/auth/login' className='text-primary hover:underline'>
									Sign In instead
								</Link>
							</p>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
