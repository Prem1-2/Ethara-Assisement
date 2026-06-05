"use client";

export function ProductivityRing({ percentage = 0, improvement = 12 }) {
	const strokeWidth = 6;
	const radius = 30;
	const circumference = 2 * Math.PI * radius;
	const safePercentage = Math.min(100, Math.max(0, percentage));
	const offset = circumference - (safePercentage / 100) * circumference;

	return (
		<div className="flex flex-col items-center justify-center gap-4 p-5 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all h-full">
			<h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest self-start leading-none">Productivity</h3>
			
			<div className="relative flex items-center justify-center">
				<svg className="w-28 h-28 transform -rotate-90">
					<circle
						cx="56"
						cy="56"
						r={radius}
						stroke="currentColor"
						strokeWidth={strokeWidth}
						fill="transparent"
						className="text-muted/10"
					/>
					<circle
						cx="56"
						cy="56"
						r={radius}
						stroke="currentColor"
						strokeWidth={strokeWidth}
						fill="transparent"
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						strokeLinecap="round"
						className="text-emerald-500 transition-all duration-1000 ease-out"
					/>
				</svg>
				<div className="absolute flex flex-col items-center justify-center">
					<span className="text-2xl font-black text-foreground">{safePercentage}%</span>
				</div>
			</div>
			
			<div className="flex flex-col items-center gap-0.5 text-center">
				<p className="text-xs font-bold text-foreground leading-none">Overall Score</p>
				<p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
					<span className="flex items-center justify-center w-3 h-3 rounded-full bg-emerald-100 text-[8px] font-black">+</span>
					{improvement}% week
				</p>
			</div>
		</div>
	);
}
