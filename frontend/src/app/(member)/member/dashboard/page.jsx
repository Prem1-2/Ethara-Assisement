"use client";
import { useEffect, useState } from "react";
import { get_member_dashboard_api } from "@/api/api";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	CheckCircle2Icon,
	ClockIcon,
	ListTodoIcon,
	AlertTriangleIcon,
	LayersIcon,
	Filter,
	LayoutGrid,
	List,
	MoreVertical,
	Calendar as CalendarIcon,
	ChevronDown,
	ChevronRight,
	MessageSquareIcon,
} from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import StatCard from "@/components/app_component/member/dashboard/statsCard";
import { WelcomeBanner } from "@/components/app_component/member/dashboard/welcomeBanner";
import { PriorityDonut } from "@/components/app_component/member/dashboard/priorityDonut";
import { ProductivityRing } from "@/components/app_component/member/dashboard/productivityRing";
import { QuickActions } from "@/components/app_component/member/dashboard/quickActions";
import { UpcomingDeadlines } from "@/components/app_component/member/dashboard/upcomingDeadlines";
import { RecentActivity } from "@/components/app_component/member/dashboard/recentActivity";
import { SimpleCalendar } from "@/components/app_component/member/dashboard/simpleCalendar";
import { TeamMembersWidget } from "@/components/app_component/member/dashboard/teamMembersWidget";
import { toast } from "sonner";

const chartConfig = {
	done: { label: "Done", color: "#10b981" },
	inProgress: { label: "In Progress", color: "#3b82f6" },
	todo: { label: "To Do", color: "#f59e0b" },
};

const STATUS_META = {
	todo: { label: "To Do", bg: "bg-amber-100", text: "text-amber-700" },
	"in-progress": { label: "In Progress", bg: "bg-blue-100", text: "text-blue-700" },
	done: { label: "Done", bg: "bg-emerald-100", text: "text-emerald-700" },
};

const PRIORITY_META = {
	High: { bg: "bg-red-50", text: "text-red-600" },
	Medium: { bg: "bg-amber-50", text: "text-amber-600" },
	Low: { bg: "bg-emerald-50", text: "text-emerald-600" },
};

export default function MemberDashboardPage() {
	const [data, setData] = useState(null);
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [taskTab, setTaskTab] = useState("all");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [dashData, msgData] = await Promise.all([
					get_member_dashboard_api(),
					axiosInstance.get("/messages").catch(() => ({ data: { messages: [] } }))
				]);
				setData(dashData);
				setMessages(msgData.data.messages || []);
			} catch (err) {
				console.error("Dashboard Fetch Error:", err);
				if (err.response?.status === 403) {
					toast.error("Access Forbidden (403). Please check your permissions or re-login.");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchData();
		const interval = setInterval(fetchData, 10000); // Poll every 10s
		return () => clearInterval(interval);
	}, []);

	const stats = data?.stats || {};
	const chartData = data?.taskProgress || [];
	const allTasks = data?.recentTasks || [];
	const user = data?.user;

	const filteredTasks = taskTab === "all" 
		? allTasks 
		: allTasks.filter(t => t.status !== "done");

	const deadlineDates = allTasks
		.filter(t => t.dueDate && t.status !== "done")
		.map(t => new Date(t.dueDate).toISOString().split('T')[0]);

	const completionRate =
		stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0;

	return (
		<div className="min-h-screen bg-[#fcfcfc] dark:bg-background">
			<SiteHeader title="Dashboard" />
			<div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 max-w-[1600px] mx-auto">

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
					<div className="lg:col-span-8 space-y-5">
						<WelcomeBanner user={user} stats={stats} />
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
							{loading ? (
								Array.from({ length: 4 }).map((_, i) => (
									<Card key={i} className="animate-pulse rounded-2xl h-24 bg-muted/20" />
								))
							) : (
								<>
									<StatCard icon={LayersIcon} label="Total Tasks" value={stats.totalTasks || 0} color="text-indigo-500" trend="+4%" sub="Assigned" />
									<StatCard icon={ListTodoIcon} label="To Do" value={stats.todoTasks || 0} color="text-amber-500" trend="-2%" sub="Remaining" />
									<StatCard icon={ClockIcon} label="In Progress" value={stats.inProgressTasks || 0} color="text-blue-500" trend="+8%" sub="Working" />
									<StatCard icon={CheckCircle2Icon} label="Completed" value={stats.doneTasks || 0} sub={`${completionRate}% rate`} trend="+15%" color="text-emerald-500" />
								</>
							)}
						</div>
					</div>

					<div className="lg:col-span-4">
						<RecentActivity tasks={allTasks} />
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
					<div className="lg:col-span-8">
						<Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card h-full">
							<CardHeader className="flex flex-row items-center justify-between pb-4">
								<div className="space-y-0.5">
									<CardTitle className="text-lg font-bold">Task Progress</CardTitle>
									<CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last 6 months activity</CardDescription>
								</div>
								<button className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/50 border border-border text-[10px] font-bold text-muted-foreground">
									May 2026 <ChevronDown className="size-3" />
								</button>
							</CardHeader>
							<CardContent>
								{loading ? (
									<div className="h-[200px] animate-pulse rounded-xl bg-muted/10" />
								) : (
									<ChartContainer config={chartConfig} className="h-[200px] min-h-[200px] w-full">
										<AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
											<defs>
												<linearGradient id="fillDone" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
												<linearGradient id="fillInProgress" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
												<linearGradient id="fillTodo" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
											</defs>
											<CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.05} />
											<XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
											<YAxis tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
											<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
											<Area dataKey="done" type="monotone" fill="url(#fillDone)" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981", strokeWidth: 1, stroke: "#fff" }} />
											<Area dataKey="inProgress" type="monotone" fill="url(#fillInProgress)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6", strokeWidth: 1, stroke: "#fff" }} />
											<Area dataKey="todo" type="monotone" fill="url(#fillTodo)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b", strokeWidth: 1, stroke: "#fff" }} />
										</AreaChart>
									</ChartContainer>
								)}
								<div className="flex items-center justify-center gap-4 pt-4 mt-2 border-t border-border/10">
									<div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Completed</span></div>
									<div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">In Progress</span></div>
									<div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">To Do</span></div>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="lg:col-span-4">
						<PriorityDonut totalTasks={stats.totalTasks} high={stats.highTasks} medium={stats.mediumTasks} low={stats.lowTasks} />
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
					<div className="lg:col-span-8">
						<Card className="rounded-2xl border-border/50 shadow-sm bg-card overflow-hidden h-full">
							<CardHeader className="flex flex-row items-center justify-between pb-4">
								<div className="flex items-center gap-4">
									<CardTitle className="text-lg font-bold">My Tasks</CardTitle>
									<div className="flex items-center gap-3">
										<button 
											onClick={() => setTaskTab("all")}
											className={`text-xs font-bold transition-all pb-0.5 ${taskTab === "all" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
										>
											All
										</button>
										<button 
											onClick={() => setTaskTab("pending")}
											className={`text-xs font-bold transition-all pb-0.5 ${taskTab === "pending" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
										>
											Pending
										</button>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<button className="p-1.5 rounded-lg bg-muted/50 border border-border text-muted-foreground hover:text-foreground transition-all"><Filter className="size-3.5" /></button>
								</div>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<table className="w-full text-left">
										<thead>
											<tr className="border-b border-border/50">
												<th className="pb-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Task Name</th>
												<th className="pb-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Priority</th>
												<th className="pb-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Due Date</th>
												<th className="pb-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Status</th>
												<th className="pb-3 w-8"></th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border/20">
											{filteredTasks.length === 0 ? (
												<tr>
													<td colSpan={5} className="py-8 text-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">No tasks found</td>
												</tr>
											) : (
												filteredTasks.map((task) => {
													const status = STATUS_META[task.status] || STATUS_META.todo;
													const priority = PRIORITY_META[task.priority || 'Medium'];
													const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
													return (
														<tr key={task._id} className="group hover:bg-muted/10 transition-all">
															<td className="py-3">
																<p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer">{task.title}</p>
																<p className="text-[9px] font-medium text-muted-foreground/60">{task.projectId?.name || "Project"}</p>
															</td>
															<td className="py-3 text-center">
																<span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${priority.bg} ${priority.text}`}>
																	{task.priority || 'Medium'}
																</span>
															</td>
															<td className="py-3">
																<div className="flex flex-col items-center">
																	<p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
																		<CalendarIcon className="size-2.5" />
																		{new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
																	</p>
																	{isOverdue && <span className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-0.5">Overdue</span>}
																</div>
															</td>
															<td className="py-3 text-center">
																<span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${status.bg} ${status.text}`}>
																	{status.label}
																</span>
															</td>
															<td className="py-3 text-center">
																<button className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"><MoreVertical className="size-3.5" /></button>
															</td>
														</tr>
													);
												})
											)}
										</tbody>
									</table>
								</div>
								<div className="flex justify-center pt-4">
									<Link href="/member/tasks" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
										View all tasks <ChevronRight className="size-3" />
									</Link>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="lg:col-span-4">
						<QuickActions />
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
					<ProductivityRing percentage={completionRate} />
					<SimpleCalendar highlightedDates={deadlineDates} />
					<UpcomingDeadlines tasks={allTasks} />
					<Card className="rounded-2xl border-border/50 shadow-sm bg-card overflow-hidden h-full">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recent Messages</h3>
							<Link href="/member/messages" className="text-[10px] font-bold text-primary hover:underline">View All</Link>
						</CardHeader>
						<CardContent className="p-0">
							<div className="divide-y divide-border/10">
								{messages.length === 0 ? (
									<div className="p-8 text-center text-[10px] font-bold text-muted-foreground/40">No messages yet</div>
								) : (
									messages.slice(-3).reverse().map((msg, idx) => (
										<div key={idx} className="p-4 hover:bg-muted/30 transition-colors flex gap-3">
											<div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
												<MessageSquareIcon className="size-3.5 text-primary" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between">
													<p className="text-[10px] font-black text-foreground uppercase truncate">{msg.sender?.full_name}</p>
													<div className="flex items-center gap-2">
														<span className="text-[8px] font-bold text-muted-foreground/40 uppercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
														<Link 
															href={`/member/messages?userId=${msg.sender?._id}`}
															className="text-[8px] font-black text-primary uppercase hover:underline"
														>
															Reply
														</Link>
													</div>
												</div>
												<p className="text-[10px] font-medium text-muted-foreground truncate">{msg.content}</p>
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
