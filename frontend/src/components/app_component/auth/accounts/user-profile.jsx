"use client";

import { Card, CardContent } from "@/components/ui/card";

export function UserProfileCard({ userData }) {
	return (
		<Card className='card-premium overflow-hidden'>
			<CardContent className='p-6'>
				<div className='flex flex-col items-center gap-4 text-center md:flex-row md:text-left md:gap-6'>
					{/* Avatar */}
					<div className='flex h-20 w-20 items-center justify-center rounded-xl bg-primary/15 flex-shrink-0'>
						<span className='text-2xl font-bold text-primary'>
							{userData.name}
						</span>
					</div>

					{/* Info */}
					<div className='flex-1'>
						<div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
							<div>
								<h1 className='text-2xl font-bold tracking-tight text-foreground'>
									{userData.name}
								</h1>
								<p className='text-sm text-muted-foreground'>
									{userData.email}
								</p>
							</div>
							<div className='flex items-center gap-2'>
								<span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30'>
									<span className='w-2 h-2 bg-primary rounded-full' />
									<span className='text-xs font-semibold text-primary capitalize'>
										{userData.role}
									</span>
								</span>
							</div>
						</div>

						{/* Organization & Department */}
						<div className='mt-4 grid grid-cols-2 gap-4 md:grid-cols-3'>
							<div>
								<p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
									Organization
								</p>
								<p className='mt-1 text-sm font-medium text-foreground'>
									{userData.organization}
								</p>
							</div>
							<div>
								<p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
									Department
								</p>
								<p className='mt-1 text-sm font-medium text-foreground'>
									{userData.department}
								</p>
							</div>
							<div>
								<p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
									Joined
								</p>
								<p className='mt-1 text-sm font-medium text-foreground'>
									{userData.joinedDate}
								</p>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
