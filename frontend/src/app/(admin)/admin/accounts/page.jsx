"use client";
import React from "react";
import { UserActivitySection } from "@/components/app_component/auth/accounts/user-activity";
import { UserDetailsSection } from "@/components/app_component/auth/accounts/user-detail-section";
import { UserProfileCard } from "@/components/app_component/auth/accounts/user-profile";
import { usere_profile } from "@/api/api";
import { SiteHeader } from "@/components/site-header";

export default function AccountPage() {
	const handleSaveDetails = async (data) => {
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));
		console.log("Saving user details:", data);
	};

	const handleLogoutSession = async (sessionId) => {
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 800));
		console.log("Logging out session:", sessionId);
	};

	const handleLogoutAllSessions = async () => {
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));
		console.log("Logging out all sessions");
	};
	const [userData, setUserData] = React.useState({});
	const [sessionData, setSessionData] = React.useState([]);

	React.useEffect(() => {
		const fetchUserFromAPI = async () => {
			try {
				const response = await usere_profile();
				const user = response.data.user;
				const sessions = response.data.session;

				setUserData({
					_id: user._id,
					name: user.full_name,
					email: user.email,
					username: user.username,
					role: user.role,
					organization: user.company,
					department: user.department,
					title: user.job_title,
					joinedDate: new Date(user.createdAt).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
					lastLogin: new Date(
						sessions.find((s) => s.isCurrent)?.lastActive || Date.now(),
					).toLocaleString(),
				});

				setSessionData(sessions);
				console.log("session date", sessionData);
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		};
		fetchUserFromAPI();
	}, []);

	return (
		<>
			<SiteHeader title={"Accounts"} />
			<main className='min-h-svh bg-background py-8 md:py-12 animate-fade-in-up'>
				<div className='mx-auto max-w-6xl px-4 md:px-6 lg:px-8'>
					{/* Header */}
					<div className='mb-8'>
						<h1 className='text-4xl font-bold tracking-tight text-foreground'>
							Account Settings
						</h1>
						<p className='mt-2 text-muted-foreground'>
							Manage your account information, security, and activity
						</p>
					</div>

					{/* Profile Card */}
					<div className='mb-8'>
						<UserProfileCard userData={userData} />
					</div>

					{/* Main Content - Two Column Layout */}
					<div className='grid gap-8 lg:grid-cols-3'>
						{/* Left Column - Details */}
						<div className='lg:col-span-2'>
							<UserDetailsSection
								userData={userData}
								isEditing={userData.role === "admin"}
								onSave={handleSaveDetails}
							/>
						</div>

						{/* Right Column - Activity */}
						<div>
							{sessionData && sessionData.length > 0 && (
								<UserActivitySection
									userData={userData}
									sessionData={sessionData}
									onLogoutSession={handleLogoutSession}
									onLogoutAllSessions={handleLogoutAllSessions}
								/>
							)}
						</div>
					</div>

					{/* Footer Info */}
					<div className='mt-12 border-t border-border pt-8'>
						<div className='grid gap-6 md:grid-cols-3'>
							<div>
								<h3 className='font-semibold text-foreground'>Need Help?</h3>
								<p className='mt-2 text-sm text-muted-foreground'>
									Check our{" "}
									<a
										href='#'
										className='text-primary hover:text-primary/80 transition-colors'
									>
										documentation
									</a>{" "}
									for detailed guides
								</p>
							</div>
							<div>
								<h3 className='font-semibold text-foreground'>
									Security Concerns?
								</h3>
								<p className='mt-2 text-sm text-muted-foreground'>
									Email us at{" "}
									<a
										href='mailto:security@ethara.ai'
										className='text-primary hover:text-primary/80 transition-colors'
									>
										security@ethara.ai
									</a>
								</p>
							</div>
							<div>
								<h3 className='font-semibold text-foreground'>
									Report an Issue
								</h3>
								<p className='mt-2 text-sm text-muted-foreground'>
									Contact{" "}
									<a
										href='#'
										className='text-primary hover:text-primary/80 transition-colors'
									>
										support
									</a>{" "}
									for technical assistance
								</p>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
