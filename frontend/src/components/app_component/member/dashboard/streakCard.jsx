"use client";

import { Trophy, Flame } from "lucide-react";

export function StreakCard() {
	return (
		<div className="mx-4 my-6 p-4 rounded-2xl bg-gradient-to-br from-orange-400/10 to-yellow-400/10 border border-orange-200/50 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
			<div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-110 transition-transform">
				<Trophy className="size-12 text-orange-500" />
			</div>
			
			<div className="relative z-10 flex flex-col gap-3">
				<div className="flex items-center gap-2">
					<div className="p-1.5 rounded-lg bg-orange-500 shadow-lg shadow-orange-500/20">
						<Flame className="size-4 text-white animate-pulse" />
					</div>
					<span className="text-sm font-bold text-orange-700">5 Day Streak</span>
				</div>
				
				<p className="text-xs text-orange-600/80 font-medium">Keep going strong! You're in the top 10% this week.</p>
				
				<div className="space-y-1.5">
					<div className="flex justify-between text-[10px] font-bold text-orange-700/60 uppercase tracking-wider">
						<span>Progress</span>
						<span>80%</span>
					</div>
					<div className="h-1.5 w-full bg-orange-200/50 rounded-full overflow-hidden">
						<div className="h-full bg-orange-500 rounded-full" style={{ width: "80%" }} />
					</div>
				</div>
			</div>
		</div>
	);
}
