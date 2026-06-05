"use client";

import Image from "next/image";

export function WelcomeBanner({ user, stats }) {
	const completionRate =
		stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0;

	return (
		<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border border-primary/10 p-5 shadow-sm">
			<div className="relative z-10 grid md:grid-cols-2 gap-4 items-center">
				<div className="space-y-4">
					<div className="space-y-1">
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							Welcome back, {user?.full_name?.split(" ")[0]}! 👋
						</h1>
						<p className="text-muted-foreground text-sm max-w-md">
							Let's make today productive and achieve more.
						</p>
					</div>

					<div className="flex flex-wrap gap-6">
						<div className="space-y-0.5">
							<p className="text-xl font-bold text-primary">{completionRate}%</p>
							<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed this week</p>
						</div>
						<div className="w-px h-8 bg-border/50 hidden sm:block" />
						<div className="space-y-0.5">
							<p className="text-xl font-bold text-foreground">5</p>
							<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Day streak</p>
						</div>
						<div className="w-px h-8 bg-border/50 hidden sm:block" />
						<div className="space-y-0.5">
							<p className="text-xl font-bold text-foreground">{stats.doneTasks || 0}</p>
							<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tasks done</p>
						</div>
					</div>
				</div>

				<div className="relative flex justify-center md:justify-end">
					<div className="relative w-full max-w-[180px] aspect-square animate-float">
						<Image
							src="/dashboard_welcome_illustration_1778869389120.png"
							alt="Productivity Illustration"
							fill
							className="object-contain"
							priority
						/>
					</div>
				</div>
			</div>
			
			<div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
		</div>
	);
}
