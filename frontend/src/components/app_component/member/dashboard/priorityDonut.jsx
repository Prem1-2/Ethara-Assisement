"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

export function PriorityDonut({ totalTasks = 18, high = 5, medium = 8, low = 5 }) {
	const data = [
		{ name: "High", value: high, color: "#ef4444" },
		{ name: "Medium", value: medium, color: "#f59e0b" },
		{ name: "Low", value: low, color: "#10b981" },
	];
	return (
		<div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all h-full">
			<h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tasks by Priority</h3>
			
			<div className="h-[140px] min-h-[140px] w-full relative">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={45}
							outerRadius={60}
							paddingAngle={6}
							dataKey="value"
						>
							{data.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
							))}
						</Pie>
					</PieChart>
				</ResponsiveContainer>
				<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
					<span className="text-2xl font-black text-foreground leading-none">{totalTasks}</span>
					<span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Tasks</span>
				</div>
			</div>
			
			<div className="grid grid-cols-1 gap-2">
				{data.map((item) => (
					<div key={item.name} className="flex items-center justify-between group cursor-default">
						<div className="flex items-center gap-2">
							<div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
							<span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="text-sm font-bold text-foreground">{item.value}</span>
							<span className="text-[11px] font-bold text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded-md">
								{Math.round((item.value / totalTasks) * 100)}%
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
