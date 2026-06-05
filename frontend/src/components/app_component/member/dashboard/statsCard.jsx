import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const miniChartData = [
	{ v: 30 }, { v: 45 }, { v: 35 }, { v: 50 }, { v: 40 }, { v: 60 }, { v: 55 }
];

export default function StatCard({ icon: Icon, label, value, sub, color, trend = "+12%" }) {
	const getThemeColors = () => {
		if (color.includes("emerald") || color.includes("green")) {
			return { stroke: "#10b981", fill: "url(#fillGreen)", bg: "bg-emerald-50", icon: "text-emerald-500", badge: "bg-emerald-100 text-emerald-700" };
		}
		if (color.includes("blue")) {
			return { stroke: "#3b82f6", fill: "url(#fillBlue)", bg: "bg-blue-50", icon: "text-blue-500", badge: "bg-blue-100 text-blue-700" };
		}
		if (color.includes("amber") || color.includes("yellow")) {
			return { stroke: "#f59e0b", fill: "url(#fillYellow)", bg: "bg-amber-50", icon: "text-amber-500", badge: "bg-amber-100 text-amber-700" };
		}
		return { stroke: "#6366f1", fill: "url(#fillIndigo)", bg: "bg-indigo-50", icon: "text-indigo-500", badge: "bg-indigo-100 text-indigo-700" };
	};

	const theme = getThemeColors();

	return (
		<Card className="rounded-2xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300 bg-card overflow-hidden">
			<CardContent className="p-5 flex flex-col h-full">
				<div className="flex justify-between items-start mb-4">
					<div className="flex items-center gap-3">
						<div className={`p-2.5 rounded-full ${theme.bg} flex items-center justify-center`}>
							<Icon className={`size-5 ${theme.icon}`} />
						</div>
						<span className="text-sm font-medium text-muted-foreground">{label}</span>
					</div>
					<span className="text-3xl font-bold text-foreground tracking-tight">{value}</span>
				</div>
				
				<div className="h-16 w-full -mx-2 overflow-hidden mb-4">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={miniChartData}>
							<defs>
								<linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
								<linearGradient id="fillBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
								<linearGradient id="fillYellow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
								<linearGradient id="fillIndigo" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
							</defs>
							<Area 
								type="monotone" 
								dataKey="v" 
								stroke={theme.stroke} 
								strokeWidth={2} 
								fill={theme.fill}
								dot={{ r: 3, fill: theme.stroke, strokeWidth: 2, stroke: "#fff" }}
								activeDot={{ r: 4, strokeWidth: 0 }}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>

				<div className="flex items-center gap-3 mt-auto">
					<div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${theme.badge}`}>
						<span className="transform rotate-[-45deg]">↑</span>
						{trend}
					</div>
					<span className="text-[10px] text-muted-foreground/70 font-medium whitespace-nowrap">from last week</span>
				</div>
			</CardContent>
		</Card>
	);
}