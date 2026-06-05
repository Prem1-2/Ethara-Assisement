"use client";

import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { logout_api } from "@/api/api";

export default function UnauthorizedPage() {
	const handleLogout = async () => {
		try {
			await logout_api();
			window.location.href = "/auth/login";
		} catch (error) {
			window.location.href = "/auth/login";
		}
	};

	return (
		<main className='flex min-h-svh flex-col items-center justify-center bg-background p-4 md:p-6'>
			<div className='w-full max-w-md text-center space-y-8 animate-fade-in-up'>
				<div className='flex items-center justify-center'>
					<div className='relative'>
						<div className='absolute inset-0 bg-red-500/20 blur-3xl rounded-full' />
						<div className='relative flex items-center justify-center w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 shadow-2xl'>
							<ShieldAlert className='w-12 h-12 text-red-500' />
						</div>
					</div>
				</div>

				<div className='space-y-3'>
					<h1 className='text-4xl font-black tracking-tight uppercase'>Access Denied</h1>
					<p className='text-muted-foreground font-medium text-balance'>
						Oops! It looks like you've reached a restricted area. Your account doesn't have the necessary permissions to view this dashboard.
					</p>
				</div>

				<div className='flex flex-col sm:flex-row gap-4 items-center justify-center pt-4'>
					<button 
						onClick={handleLogout}
						className="flex items-center gap-2 h-12 px-8 rounded-xl font-bold bg-muted/50 border border-border/50 hover:bg-muted transition-all text-sm"
					>
						<ArrowLeft className="w-4 h-4" />
						Login with Different Account
					</button>
					
					<Link 
						href="/" 
						className="flex items-center gap-2 h-12 px-8 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm"
					>
						<Home className="w-4 h-4" />
						Back to My Dashboard
					</Link>
				</div>

				<div className='pt-8 border-t border-border/10'>
					<p className='text-xs text-muted-foreground font-medium'>
						If you believe this is an error, please contact your <span className="text-foreground font-bold">System Administrator</span>.
					</p>
				</div>
			</div>
		</main>
	);
}
