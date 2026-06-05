"use client";

import * as React from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart";

const chartConfig = {
	done: {
		label: "Done",
		color: "var(--chart-1)",
	},
	inProgress: {
		label: "In Progress",
		color: "var(--chart-2)",
	},
	todo: {
		label: "To Do",
		color: "var(--chart-3)",
	},
};

export function ChartAreaInteractive({ data, loading }) {
	const chartData = data?.taskProgress || [];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Task Progress</CardTitle>
				<CardDescription>
					Monthly breakdown of tasks by status over the last 6 months
				</CardDescription>
			</CardHeader>
			<CardContent className="px-2 sm:px-6">
				{loading ? (
					<div className="h-[280px] w-full animate-pulse rounded-md bg-muted" />
				) : chartData.length === 0 ? (
					<div className="h-[280px] w-full flex items-center justify-center text-muted-foreground text-sm">
						No task data available yet
					</div>
				) : (
					<ChartContainer config={chartConfig} className="h-[280px] w-full">
						<AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
							<defs>
								<linearGradient id="fillDone" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-done)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-done)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillInProgress" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-inProgress)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-inProgress)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillTodo" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-todo)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-todo)" stopOpacity={0.1} />
								</linearGradient>
							</defs>
							<CartesianGrid vertical={false} strokeDasharray="3 3" />
							<XAxis
								dataKey="month"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								tick={{ fontSize: 12 }}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								tick={{ fontSize: 12 }}
								allowDecimals={false}
							/>
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent indicator="dot" />}
							/>
							<ChartLegend content={<ChartLegendContent />} />
							<Area
								dataKey="done"
								type="monotone"
								fill="url(#fillDone)"
								stroke="var(--color-done)"
								strokeWidth={2}
							/>
							<Area
								dataKey="inProgress"
								type="monotone"
								fill="url(#fillInProgress)"
								stroke="var(--color-inProgress)"
								strokeWidth={2}
							/>
							<Area
								dataKey="todo"
								type="monotone"
								fill="url(#fillTodo)"
								stroke="var(--color-todo)"
								strokeWidth={2}
							/>
						</AreaChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
