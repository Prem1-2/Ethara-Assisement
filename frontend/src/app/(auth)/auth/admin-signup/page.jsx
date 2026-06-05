import { SignupForm } from "@/components/app_component/auth/signup/signupForm";

export const metadata = {
	title: "Admin Sign Up | Ethara AI",
	description: "Register as an Administrator to manage Ethara AI workflows and team members",
};

export default function AdminSignupPage() {
	return (
		<main className='flex min-h-svh flex-col items-center justify-center bg-background p-4 md:p-6'>
			<div className='w-full max-w-sm md:max-w-4xl'>
				<SignupForm role="admin" />
			</div>
		</main>
	);
}
