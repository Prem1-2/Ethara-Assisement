"use client";
import { CheckCircle2, PlusCircle, UserPlus, FileEdit, Info, Clock } from "lucide-react";

export function RecentActivity({ tasks = [] }) {
	const formatTime = (date) => {
		const diff = new Date() - new Date(date);
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return "just now";
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		return new Date(date).toLocaleDateString();
	};

	const activities = tasks.slice(0, 5).map(task => {
		const isUpdated = new Date(task.updatedAt) > new Date(task.createdAt);
		return {
			user: "System",
			action: isUpdated ? "updated" : "assigned",
			task: task.title,
			time: formatTime(task.updatedAt),
			icon: isUpdated ? Clock : PlusCircle,
			color: isUpdated ? "text-blue-500" : "text-emerald-500",
			bg: isUpdated ? "bg-blue-500/10" : "bg-emerald-500/10"
		};
	});

	const displayActivities = activities.length > 0 ? activities : [
		{ user: "Admin", action: "welcomed you", task: "to the workspace", time: "just now", icon: Info, color: "text-slate-500", bg: "bg-slate-500/10" }
	];

	return (
		<div className="flex flex-col gap-4 p-5 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all h-full">
			<div className="flex items-center justify-between">
				<h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Recent Activity</h3>
				<button className="text-[10px] font-bold text-primary hover:underline leading-none">View all</button>
			</div>
			
			<div className="space-y-4">
				{displayActivities.map((activity, idx) => (
					<div key={idx} className="flex gap-3 group">
						<div className="relative flex flex-col items-center">
							<div className={`p-1.5 rounded-lg ${activity.bg} ${activity.color} group-hover:scale-110 transition-transform`}>
								<activity.icon className="size-3.5" />
							</div>
							{idx !== displayActivities.length - 1 && (
								<div className="w-px h-full bg-border/30 mt-2" />
							)}
						</div>
						<div className="space-y-0.5 pb-2">
							<p className="text-xs font-bold text-foreground leading-tight">
								<span className="text-primary">{activity.user}</span> {activity.action}
							</p>
							<p className="text-[10px] text-muted-foreground font-medium truncate max-w-[180px]">{activity.task}</p>
							<p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">{activity.time}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
