"use client";
import { useEffect, useState } from "react";
import { get_admin_progress_api } from "@/api/api";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {StatPill} from  "../../../../helpers/helper.js"
import {
	ChevronRightIcon,
	SearchIcon,
	FolderKanbanIcon,
	CheckCircle2Icon,
	ClockIcon,
	ListTodoIcon,
	AlertTriangleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { MemberDetailDialog } from "@/components/app_component/admin/progress/memberDetailDialog";
import { ProjectDetailView } from "@/components/app_component/admin/progress/projectDetailView";

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, className = "" }) {
	return (
		<div className={`h-2 w-full rounded-full bg-muted overflow-hidden ${className}`}>
			<div
				className="h-full rounded-full bg-primary transition-all duration-500"
				style={{ width: `${Math.min(100, value)}%` }}
			/>
		</div>
	);
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProgressPage() {
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [activeProjectId, setActiveProjectId] = useState(null);
	const [memberDialogId, setMemberDialogId] = useState(null);

	useEffect(() => {
		get_admin_progress_api()
			.then((d) => setProjects(d.projects))
			.catch(() => toast.error("Failed to load projects"))
			.finally(() => setLoading(false));
	}, []);

	const filtered = projects.filter(
		(p) =>
			p.name.toLowerCase().includes(search.toLowerCase()) ||
			p.team?.name?.toLowerCase().includes(search.toLowerCase()),
	);

	if (activeProjectId) {
		return (
			<>
				<SiteHeader title="Progress Tracker" />
				<div className="flex flex-1 flex-col p-4 lg:p-6">
					<ProjectDetailView
						projectId={activeProjectId}
						onBack={() => setActiveProjectId(null)}
					/>
				</div>
			</>
		);
	}

	return (
		<>
			<SiteHeader title="Progress Tracker" />
			<div className="flex flex-1 flex-col gap-5 p-4 lg:p-6">

				{/* Search */}
				<div className="relative max-w-sm">
					<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search projects or teams..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
				</div>

				{/* Project cards grid */}
				{loading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="h-44 animate-pulse rounded-xl bg-muted" />
						))}
					</div>
				) : filtered.length === 0 ? (
					<div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
						No projects found
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{filtered.map((proj) => {
							const { stats } = proj;
							return (
								<Card
									key={proj._id}
									className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/40"
									onClick={() => setActiveProjectId(proj._id)}
								>
									<CardHeader className="pb-3">
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0">
												<CardTitle className="text-base truncate">{proj.name}</CardTitle>
												{proj.team && (
													<CardDescription className="mt-0.5">
														Team: {proj.team.name}
													</CardDescription>
												)}
											</div>
											<FolderKanbanIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
										</div>
									</CardHeader>
									<CardContent className="space-y-3">
										{/* Completion */}
										<div className="space-y-1">
											<div className="flex justify-between text-xs">
												<span className="text-muted-foreground">Completion</span>
												<span className="font-semibold">{stats.completionRate}%</span>
											</div>
											<ProgressBar value={stats.completionRate} />
										</div>

										{/* Mini stats */}
										<div className="flex flex-wrap gap-x-4 gap-y-1">
											<StatPill icon={ListTodoIcon} label="Todo" value={stats.todo} color="text-blue-500" />
											<StatPill icon={ClockIcon} label="WIP" value={stats.inProgress} color="text-yellow-500" />
											<StatPill icon={CheckCircle2Icon} label="Done" value={stats.done} color="text-green-500" />
											{stats.overdue > 0 && (
												<StatPill icon={AlertTriangleIcon} label="Overdue" value={stats.overdue} color="text-destructive" />
											)}
										</div>

										<div className="flex items-center justify-between pt-1">
											<span className="text-xs text-muted-foreground">{stats.total} task{stats.total !== 1 ? "s" : ""} total</span>
											<Button variant="ghost" size="sm" className="h-7 text-xs gap-1 -mr-2">
												View Progress <ChevronRightIcon className="h-3.5 w-3.5" />
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</div>

			<MemberDetailDialog
				memberId={memberDialogId}
				open={!!memberDialogId}
				onClose={() => setMemberDialogId(null)}
			/>
		</>
	);
}
