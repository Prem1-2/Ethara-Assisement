import { RequestAccountForm } from "@/components/app_component/auth/requestAccountForm/requeestForm";

export const metadata = {
	title: "Request Access | Ethara AI",
	description:
		"Request access to Ethara AI - Advanced LLM post-training and data operations platform",
};

export default function RequestAccountPage() {
	return (
		<main className='flex min-h-svh flex-col items-center justify-center bg-background p-4 md:p-6'>
			<div className='w-full max-w-sm md:max-w-4xl'>
				<RequestAccountForm />
			</div>
			<div className='mt-8 text-center'>
				<p className='text-xs text-muted-foreground'>
					Have questions?{" "}
					<a
						href='#'
						className='font-medium text-primary hover:text-primary/80 transition-colors'
					>
						Reach out to our team
					</a>
				</p>
			</div>
		</main>
	);
}
