"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function SectionCards({ data, loading }) {
	if (loading) {
		return (
			<div className='grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
				{[1, 2, 3, 4].map((i) => (
					<Card key={i} className='animate-pulse'>
						<CardHeader>
							<div className='h-4 bg-muted rounded w-20' />
							<div className='h-8 bg-muted rounded w-16 mt-2' />
						</CardHeader>
					</Card>
				))}
			</div>
		);
	}

	const stats = data?.stats || {};
	const taskBreakdown = data?.taskBreakdown || {};

	return (
		<div className='grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card'>
			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Total Teams</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
						{stats.totalTeams || 0}
					</CardTitle>
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='text-muted-foreground'>
						Active teams in organization
					</div>
				</CardFooter>
			</Card>
			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Total Projects</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
						{stats.totalProjects || 0}
					</CardTitle>
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='text-muted-foreground'>Projects across all teams</div>
				</CardFooter>
			</Card>
			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Total Tasks</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
						{stats.totalTasks || 0}
					</CardTitle>
					<CardAction>
						{taskBreakdown.overdue > 0 && (
							<Badge variant='destructive'>
								{taskBreakdown.overdue} Overdue
							</Badge>
						)}
					</CardAction>
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='flex gap-2 text-muted-foreground'>
						Todo: {taskBreakdown.todo || 0} | In Progress:{" "}
						{taskBreakdown.inProgress || 0} | Done: {taskBreakdown.done || 0}
					</div>
				</CardFooter>
			</Card>
			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Team Members</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
						{stats.totalMembers || 0}
					</CardTitle>
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='text-muted-foreground'>Active members in system</div>
				</CardFooter>
			</Card>
		</div>
	);
}
