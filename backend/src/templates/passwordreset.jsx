import * as React from "react";
import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Text,
	Tailwind,
} from "@react-email/components";

const PasswordReset = (props) => {
	const { username, resetUrl } = props;
	return (
		<Html lang='en' dir='ltr'>
			<Head />
			<Preview>Reset your password - action required</Preview>
			<Tailwind>
				<Body className='bg-gray-100 font-sans py-[40px]'>
					<Container className='bg-white rounded-[8px] p-[32px] max-w-[600px] mx-auto'>
						<Section>
							<Heading className='text-[24px] font-bold text-gray-900 mb-[24px] text-center'>
								Reset Your Password
							</Heading>

							<Text className='text-[16px] text-gray-700 mb-[16px] leading-[24px]'>
								Hello {username},
							</Text>

							<Text className='text-[16px] text-gray-700 mb-[24px] leading-[24px]'>
								We received a request to reset your password. Click the button
								below to create a new password:
							</Text>

							<Section className='text-center mb-[32px]'>
								<Button
									className='bg-red-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold box-border'
									href={resetUrl}
								>
									Reset Password
								</Button>
							</Section>

							<Text className='text-[14px] text-gray-600 mb-[16px] leading-[20px]'>
								If the button doesn't work, copy and paste this link into your
								browser:
							</Text>

							<Text className='text-[14px] text-blue-600 mb-[24px] break-all'>
								{resetUrl}
							</Text>

							<Section className='bg-yellow-50 border-l-[4px] border-yellow-400 p-[16px] mb-[24px]'>
								<Text className='text-[14px] text-yellow-800 m-0 leading-[20px]'>
									<strong>Security Notice:</strong> This password reset link
									will expire in 1 hour. If you didn't request this reset,
									please ignore this email and your password will remain
									unchanged.
								</Text>
							</Section>

							<Text className='text-[14px] text-gray-600 leading-[20px]'>
								If you continue to have problems, please contact our support
								team for assistance.
							</Text>
						</Section>

						<Section className='border-t border-gray-200 pt-[24px] mt-[32px]'>
							<Text className='text-[12px] text-gray-500 text-center m-0'>
								© 2025 Your Company Name. All rights reserved.
							</Text>
							<Text className='text-[12px] text-gray-500 text-center m-0'>
								123 Business Street, City, State 12345
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default PasswordReset;
