"use client";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	FolderKanbanIcon,
	ArrowRightIcon,
	CheckCircle2Icon,
	ClockIcon,
	ListTodoIcon,
	UserIcon,
	CalendarIcon,
	FolderArchiveIcon
} from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

export default function MemberProjectsPage() {
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProjects = async () => {
			try {
				const response = await axiosInstance.get("/member/projects");
				setProjects(response.data.projects || []);
			} catch (err) {
				console.error("Projects Fetch Error:", err);
				toast.error("Failed to load projects");
			} finally {
				setLoading(false);
			}
		};

		fetchProjects();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#fcfcfc] dark:bg-background">
				<SiteHeader title="My Projects" />
				<div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
					<div className="h-32 animate-pulse rounded-2xl bg-muted/20 w-full mb-6" />
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{Array.from({ length: 6 }).map((_, i) => (
							<Card key={i} className="animate-pulse rounded-2xl h-64 bg-muted/20" />
						))}
					</div>
				</div>
			</div>
		);
	}

	if (projects.length === 0) {
		return (
			<div className="min-h-screen bg-[#fcfcfc] dark:bg-background">
				<SiteHeader title="My Projects" />
				<div className="flex flex-1 flex-col items-center justify-center p-8 max-w-md mx-auto h-[70vh]">
					<div className="size-16 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center mb-4 text-blue-500">
						<FolderArchiveIcon className="size-8" />
					</div>
					<h2 className="text-lg font-bold text-foreground text-center">No Projects Found</h2>
					<p className="text-xs text-muted-foreground text-center mt-2">
						Your team does not have any active projects assigned at the moment. Please consult your manager for assignment updates.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#fcfcfc] dark:bg-background">
			<SiteHeader title="My Projects" />
			<div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
				
				{/* Projects Hero Header */}
				<div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-primary/5 p-6 md:p-8 shadow-sm">
					<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div className="space-y-1">
							<div className="flex items-center gap-2.5">
								<div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
									<FolderKanbanIcon className="size-5" />
								</div>
								<h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">My Projects</h1>
							</div>
							<p className="text-xs text-muted-foreground font-medium pl-1">
								Track, collaborate, and inspect active projects for your team.
							</p>
						</div>
						<div className="flex items-center gap-3">
							<span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider bg-muted/50 border border-border/50 px-3 py-1.5 rounded-xl">
								Active Projects: <span className="font-bold text-foreground">{projects.length}</span>
							</span>
						</div>
					</div>
					<div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-blue-500/5 to-transparent pointer-events-none" />
				</div>

				{/* Projects Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{projects.map((project) => {
						const stats = project.stats || { total: 0, todo: 0, inProgress: 0, done: 0, progress: 0 };
						const isComplete = stats.progress === 100 && stats.total > 0;

						return (
							<Card
								key={project._id}
								className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between"
							>
								<div>
									<CardHeader className="pb-3">
										<div className="flex items-start justify-between gap-2">
											<div className="space-y-1">
												<CardTitle className="text-sm font-bold line-clamp-1 hover:text-primary transition-colors">
													{project.name}
												</CardTitle>
												<CardDescription className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
													<UserIcon className="size-3 shrink-0" />
													Lead: {project.createdBy?.full_name || "Manager"}
												</CardDescription>
											</div>
											{isComplete && (
												<Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[8px] font-black uppercase tracking-wider px-2 py-0.5 shrink-0">
													Completed
												</Badge>
											)}
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<p className="text-xs text-muted-foreground line-clamp-2 min-h-8">
											{project.description || "No project description provided. Talk to your team admin for more context."}
										</p>

										{/* Progress Section */}
										<div className="space-y-1.5">
											<div className="flex items-center justify-between text-[10px] font-bold">
												<span className="text-muted-foreground/75 uppercase tracking-wide">Completion Rate</span>
												<span className={isComplete ? "text-emerald-500 font-extrabold" : "text-primary font-extrabold"}>
													{stats.progress}%
												</span>
											</div>
											<div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden">
												<div
													className={`h-full transition-all duration-300 ${
														isComplete ? "bg-emerald-500" : "bg-primary"
													}`}
													style={{ width: `${stats.progress}%` }}
												/>
											</div>
										</div>

										{/* Task Breakdown Stats */}
										<div className="grid grid-cols-3 gap-2.5 pt-3.5 border-t border-border/10">
											<div className="flex flex-col items-center p-2 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
												<ListTodoIcon className="size-3.5 text-amber-500 mb-1" />
												<span className="text-xs font-extrabold text-foreground">{stats.todo}</span>
												<span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">To Do</span>
											</div>
											<div className="flex flex-col items-center p-2 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center">
												<ClockIcon className="size-3.5 text-blue-500 mb-1" />
												<span className="text-xs font-extrabold text-foreground">{stats.inProgress}</span>
												<span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">In Dev</span>
											</div>
											<div className="flex flex-col items-center p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
												<CheckCircle2Icon className="size-3.5 text-emerald-500 mb-1" />
												<span className="text-xs font-extrabold text-foreground">{stats.done}</span>
												<span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">Done</span>
											</div>
										</div>
									</CardContent>
								</div>

								<CardFooter className="pb-4 pt-0">
									<Link
										href={`/member/tasks?search=${encodeURIComponent(project.name)}`}
										className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl text-xs font-bold border border-border/60 hover:border-primary/50 text-muted-foreground hover:text-primary bg-muted/20 hover:bg-primary/5 transition-all duration-200"
									>
										View Tasks
										<ArrowRightIcon className="size-3.5" />
									</Link>
								</CardFooter>
							</Card>
						);
					})}
				</div>
			</div>
		</div>
	);
}
