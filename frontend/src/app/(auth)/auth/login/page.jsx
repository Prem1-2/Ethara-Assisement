import { LoginForm } from "@/components/app_component/auth/login/loginForm";
import Link from "next/link";

export const metadata = {
	title: "Sign In | SecureHub",
	description: "Sign in to your SecureHub account with secure authentication",
};

export default function LoginPage() {
	return (
		<main className='flex min-h-svh flex-col items-center justify-center bg-background p-4 md:p-6'>
			<div className='w-full max-w-sm md:max-w-4xl'>
				<LoginForm />
			</div>
			<div className='mt-8 text-center'>
				<p className='text-xs text-muted-foreground'>
					Need help?{" "}
					<Link
						href='#'
						className='font-medium text-primary hover:text-primary/80 transition-colors'
					>
						Contact support
					</Link>
				</p>
			</div>
		</main>
	);
}
