import * as React from "react";
import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Text,
	Tailwind,
} from "@react-email/components";

const VerificationEmail = (props) => {
	const { username, verificationUrl } = props;

	return (
		<Html lang='en' dir='ltr'>
			<Tailwind>
				<Head />
				<Preview>
					Verify your email address to complete your account setup
				</Preview>
				<Body className='bg-gray-100 font-sans py-[40px]'>
					<Container className='bg-white rounded-[8px] px-[32px] py-[40px] mx-auto max-w-[600px]'>
						{/* Header */}
						<Section className='text-center mb-[32px]'>
							<Heading className='text-[28px] font-bold text-gray-900 m-0 mb-[8px]'>
								Verify Your Email Address
							</Heading>
							<Text className='text-[16px] text-gray-600 m-0'>
								We need to verify your email address to complete your account
								setup
							</Text>
						</Section>

						{/* Main Content */}
						<Section className='mb-[32px]'>
							<Text className='text-[16px] text-gray-700 mb-[16px] m-0'>
								Hi {username},
							</Text>
							<Text className='text-[16px] text-gray-700 mb-[16px] m-0'>
								Thanks for signing up! To get started, please verify your email
								address by clicking the button below:
							</Text>
							<Text className='text-[14px] text-gray-600 mb-[24px] m-0 bg-gray-50 p-[12px] rounded-[4px] border border-gray-200'>
								<strong>Username:</strong> {username}
							</Text>
						</Section>

						{/* Verification Button */}
						<Section className='text-center mb-[32px]'>
							<Button
								href={verificationUrl}
								className='bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border inline-block'
							>
								Verify Email Address
							</Button>
						</Section>

						{/* Alternative Link */}
						<Section className='mb-[32px]'>
							<Text className='text-[14px] text-gray-600 mb-[8px] m-0'>
								If the button doesn't work, you can copy and paste this link
								into your browser:
							</Text>
							<Link
								href={verificationUrl}
								className='text-blue-600 text-[14px] break-all'
							>
								{verificationUrl}
							</Link>
						</Section>

						{/* Security Notice */}
						<Section className='mb-[32px] p-[16px] bg-yellow-50 border border-yellow-200 rounded-[8px]'>
							<Text className='text-[14px] text-yellow-800 m-0 mb-[8px]'>
								<strong>Security Notice:</strong>
							</Text>
							<Text className='text-[14px] text-yellow-700 m-0'>
								This verification link will expire in 24 hours. If you didn't
								create an account, you can safely ignore this email.
							</Text>
						</Section>

						{/* Help Section */}
						<Section className='mb-[32px]'>
							<Text className='text-[14px] text-gray-600 m-0'>
								Need help? Contact our support team or visit our help center for
								assistance.
							</Text>
						</Section>

						{/* Footer */}
						<Section className='border-t border-gray-200 pt-[24px]'>
							<Text className='text-[12px] text-gray-500 m-0 mb-[8px]'>
								This email was sent to {username}
							</Text>
							<Text className='text-[12px] text-gray-500 m-0 mb-[8px]'>
								© 2025 Your Company Name. All rights reserved.
							</Text>
							<Text className='text-[12px] text-gray-500 m-0'>
								123 Business Street, Delhi, India
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default VerificationEmail;
