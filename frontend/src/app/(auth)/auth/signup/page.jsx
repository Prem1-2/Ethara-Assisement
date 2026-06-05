import { SignupForm } from "@/components/app_component/auth/signup/signupForm";

export const metadata = {
	title: "User Sign Up | Ethara AI",
	description: "Create your Ethara AI account to access task management and workflow dashboards",
};

export default function SignupPage() {
	return (
		<main className='flex min-h-svh flex-col items-center justify-center bg-background p-4 md:p-6'>
			<div className='w-full max-w-sm md:max-w-4xl'>
				<SignupForm role="member" />
			</div>
		</main>
	);
}
