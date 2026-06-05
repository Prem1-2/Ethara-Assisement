"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function UserActivitySection({
	userData,
	sessionData,
	onLogoutSession,
	onLogoutAllSessions,
}) {
	const [isLoggingOut, setIsLoggingOut] = useState(null);
	const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

	const handleLogoutSession = async (sessionId) => {
		if (!onLogoutSession) return;
		setIsLoggingOut(sessionId);
		try {
			await onLogoutSession(sessionId);
		} finally {
			setIsLoggingOut(null);
		}
	};

	const handleLogoutAllSessions = async () => {
		if (!onLogoutAllSessions) return;
		setIsLoggingOutAll(true);
		try {
			await onLogoutAllSessions();
		} finally {
			setIsLoggingOutAll(false);
		}
	};

	return (
		<div className='space-y-6'>
			{/* Last Login */}
			<Card className='card-premium'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<svg
							className='w-5 h-5'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
							/>
						</svg>
						Last Access
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-2'>
						<p className='text-sm text-muted-foreground'>
							Your account was last accessed:
						</p>
						<p className='text-lg font-semibold text-foreground'>
							{new Date(
								sessionData.find((s) => s.isCurrent)?.lastActive || Date.now(),
							).toLocaleString()}
						</p>
						<div className='pt-3 border-t border-border'>
							<p className='text-xs text-muted-foreground'>
								If you see unexpected activity, we recommend changing your
								password immediately.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Active Sessions */}
			<Card className='card-premium'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<CardTitle className='flex items-center gap-2'>
								<svg
									className='w-5 h-5'
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
								Active Sessions
							</CardTitle>
							<CardDescription>
								Devices and browsers currently signed in to your account
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className='space-y-3'>
						{sessionData.map((session) => (
							<div
								key={session._id}
								className='flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors'
							>
								<div className='flex-1'>
									<div className='flex items-center gap-2 mb-2'>
										<p className='font-medium text-foreground'>
											{session.device}
										</p>
										{session.isCurrent && (
											<span className='inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/30'>
												<span className='w-1.5 h-1.5 bg-primary rounded-full animate-pulse' />
												Current
											</span>
										)}
									</div>
									<p className='text-sm text-muted-foreground mb-1'>
										{session.browser} • {session.location}
									</p>
									<p className='text-xs text-muted-foreground'>
										IP: {session.ip} • Last active:{" "}
										{new Date(session.lastActive).toLocaleString()}
									</p>
								</div>
								{!session.isCurrent && userData.role === "admin" && (
									<Button
										onClick={() => handleLogoutSession(session._id)}
										disabled={isLoggingOut === session._id}
										variant='outline'
										size='sm'
										className='whitespace-nowrap'
									>
										{isLoggingOut === session._id ? "Logging out..." : "Logout"}
									</Button>
								)}
							</div>
						))}

						{userData.role === "admin" && sessionData.length > 1 && (
							<div className='pt-4 border-t border-border'>
								<Button
									onClick={handleLogoutAllSessions}
									disabled={isLoggingOutAll}
									variant='outline'
									className='w-full'
								>
									{isLoggingOutAll ?
										"Logging out all sessions..."
									:	"Logout All Other Sessions"}
								</Button>
								<p className='text-xs text-muted-foreground mt-2'>
									You&apos;ll remain signed in on this device
								</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Member-Only Notice */}
			{userData.role !== "admin" && (
				<Card className='card-premium border-amber-500/30 bg-amber-500/5'>
					<CardContent className='pt-6'>
						<div className='flex gap-3'>
							<svg
								className='w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5'
								fill='currentColor'
								viewBox='0 0 24 24'
							>
								<path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' />
							</svg>
							<div>
								<p className='font-medium text-amber-900'>Member Access</p>
								<p className='text-sm text-amber-800 mt-0.5'>
									Some advanced security features are only available to admin
									users. Contact your organization admin for assistance.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
