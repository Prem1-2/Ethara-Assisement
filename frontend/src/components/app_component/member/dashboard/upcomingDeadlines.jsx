"use client";

const PRIORITY_COLORS = {
	High: "bg-red-500",
	Medium: "bg-amber-500",
	Low: "bg-emerald-500",
};

export function UpcomingDeadlines({ tasks = [] }) {
	const upcoming = tasks
		.filter(t => t.dueDate && t.status !== "done")
		.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
		.slice(0, 3);

	const getTimeLeft = (date) => {
		const diff = new Date(date) - new Date();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		if (days < 0) return "Overdue";
		if (days === 0) return "Due today";
		if (days === 1) return "Tomorrow";
		return `${days} days left`;
	};

	return (
		<div className="flex flex-col gap-4 p-6 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all h-full">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Upcoming Deadlines</h3>
				<button className="text-xs font-bold text-primary hover:underline">View all</button>
			</div>
			
			<div className="space-y-4">
				{upcoming.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
						<p className="text-[10px] font-black uppercase tracking-widest">No Deadlines</p>
					</div>
				) : (
					upcoming.map((task) => (
						<div key={task._id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-transparent hover:border-border transition-all">
							<div className="flex items-center gap-3">
								<div className={`w-1.5 h-8 rounded-full ${PRIORITY_COLORS[task.priority] || "bg-slate-400"}`} />
								<div className="space-y-0.5">
									<p className="text-sm font-bold text-foreground leading-none truncate max-w-[120px]">{task.title}</p>
									<p className={`text-[10px] font-bold uppercase tracking-widest ${task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
										{task.priority || "Medium"} Priority
									</p>
								</div>
							</div>
							<div className="text-right">
								<p className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
									{getTimeLeft(task.dueDate)}
								</p>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
