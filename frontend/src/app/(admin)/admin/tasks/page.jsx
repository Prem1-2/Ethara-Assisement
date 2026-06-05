"use client";
import { SiteHeader } from "@/components/site-header";
import { useEffect, useState } from "react";
import {
	get_tasks_api,
	create_task_api,
	get_projects_api,
	get_teams_api,
} from "@/api/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	SearchIcon,
	FolderKanbanIcon,
	ChevronRightIcon,
	PlusIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const EMPTY_FORM = {
	title: "",
	description: "",
	status: "todo",
	priority: "Medium",
	assignedTo: "",
	projectId: "",
	dueDate: "",
};

const statusColors = {
	todo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
	"in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
	done: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};
const statusLabel = { todo: "To Do", "in-progress": "In Progress", done: "Done" };

export default function TasksPage() {
	const router = useRouter();
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	// Reference data
	const [projects, setProjects] = useState([]);
	const [teams, setTeams] = useState([]);

	// Dialog
	const [dialogOpen, setDialogOpen] = useState(false);
	const [formData, setFormData] = useState(EMPTY_FORM);
	const [assignMode, setAssignMode] = useState("single"); // "single" | "team"
	const [selectedTeamId, setSelectedTeamId] = useState("");
	const [selectedMemberIds, setSelectedMemberIds] = useState([]);
	const [saving, setSaving] = useState(false);

	// Derived: members of the selected team
	const teamMembers = selectedTeamId
		? (teams.find((t) => t._id === selectedTeamId)?.members || [])
		: [];

	// Derived: members of the project's team (for single mode)
	const projectTeamMembers = (() => {
		if (!formData.projectId) return [];
		const proj = projects.find((p) => p._id === formData.projectId);
		const teamId = proj?.teamId?._id || proj?.teamId;
		if (!teamId) return [];
		return teams.find((t) => t._id === teamId)?.members || [];
	})();

	const fetchTasks = () => {
		setLoading(true);
		get_tasks_api()
			.then((d) => setTasks(d.tasks))
			.catch(() => toast.error("Failed to fetch tasks"))
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchTasks();
		get_projects_api().then((d) => setProjects(d.projects)).catch(console.error);
		get_teams_api().then((d) => setTeams(d.teams)).catch(console.error);
		if (typeof window !== "undefined") {
			const query = new URLSearchParams(window.location.search).get("search");
			if (query) {
				setSearchQuery(query);
			}
		}
	}, []);

	// Auto-select all members when team changes
	useEffect(() => {
		if (selectedTeamId) {
			const members = teams.find((t) => t._id === selectedTeamId)?.members || [];
			setSelectedMemberIds(members.map((m) => m._id));
		} else {
			setSelectedMemberIds([]);
		}
	}, [selectedTeamId, teams]);

	// Reset assignedTo when project changes (member list changes)
	useEffect(() => {
		setFormData((prev) => ({ ...prev, assignedTo: "" }));
	}, [formData.projectId]);

	const toggleMember = (id) =>
		setSelectedMemberIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);

	const openCreate = () => {
		setFormData(EMPTY_FORM);
		setAssignMode("single");
		setSelectedTeamId("");
		setSelectedMemberIds([]);
		setDialogOpen(true);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.projectId) return toast.error("Select a project");

		setSaving(true);
		try {
			if (assignMode === "team") {
				if (!selectedTeamId) return toast.error("Select a team");
				if (selectedMemberIds.length === 0) return toast.error("Select at least one member");
				const result = await create_task_api({
					title: formData.title,
					description: formData.description,
					status: formData.status,
					priority: formData.priority,
					projectId: formData.projectId,
					dueDate: formData.dueDate,
					assignToTeam: true,
					memberIds: selectedMemberIds,
				});
				toast.success(`${result.count} task${result.count !== 1 ? "s" : ""} created`);
			} else {
				if (!formData.assignedTo) return toast.error("Select a member to assign");
				await create_task_api(formData);
				toast.success("Task created");
			}
			setDialogOpen(false);
			fetchTasks();
		} catch (err) {
			toast.error(err.response?.data?.error || "Failed to create task");
		} finally {
			setSaving(false);
		}
	};

	// Group tasks by project
	const grouped = tasks.reduce((acc, task) => {
		const pid = task.projectId?._id || "unknown";
		const pname = task.projectId?.name || "Unknown Project";
		if (!acc[pid]) acc[pid] = { id: pid, name: pname, tasks: [] };
		acc[pid].tasks.push(task);
		return acc;
	}, {});

	const projectGroups = Object.values(grouped).filter((g) => {
		if (!searchQuery) return true;
		const q = searchQuery.toLowerCase();
		return (
			g.name.toLowerCase().includes(q) ||
			g.tasks.some(
				(t) =>
					t.title.toLowerCase().includes(q) ||
					t.assignedTo?.full_name?.toLowerCase().includes(q),
			)
		);
	});

	return (
		<>
			<SiteHeader title="Tasks" />
			<div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">

				{/* Toolbar */}
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="relative flex-1 max-w-sm">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by project or task title..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-sm text-muted-foreground">
							{projectGroups.length} project{projectGroups.length !== 1 ? "s" : ""}
						</span>
						<Button onClick={openCreate}>
							<PlusIcon className="h-4 w-4 mr-1" /> Create Task
						</Button>
					</div>
				</div>

				{/* Project Cards Grid */}
				{loading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="rounded-xl border bg-card p-5 space-y-3 animate-pulse">
								<div className="h-5 w-2/3 rounded bg-muted" />
								<div className="h-4 w-1/3 rounded bg-muted" />
								<div className="flex gap-2">
									<div className="h-6 w-16 rounded-full bg-muted" />
									<div className="h-6 w-16 rounded-full bg-muted" />
								</div>
							</div>
						))}
					</div>
				) : projectGroups.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
						<FolderKanbanIcon className="h-12 w-12 opacity-30" />
						<p className="text-sm">No projects with tasks found</p>
						<Button variant="outline" size="sm" onClick={openCreate}>
							<PlusIcon className="h-4 w-4 mr-1" /> Create your first task
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{projectGroups.map((group) => {
							const counts = group.tasks.reduce(
								(acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; },
								{},
							);
							return (
								<button
									key={group.id}
									type="button"
									onClick={() => router.push(`/admin/tasks/${group.id}`)}
									className="rounded-xl border bg-card p-5 text-left hover:shadow-md hover:border-primary/40 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								>
									<div className="flex items-start justify-between gap-2 mb-3">
										<div className="flex items-center gap-2 min-w-0">
											<FolderKanbanIcon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
											<h3 className="font-semibold text-sm truncate">{group.name}</h3>
										</div>
										<ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
									</div>

									<p className="text-xs text-muted-foreground mb-4">
										{group.tasks.length} task{group.tasks.length !== 1 ? "s" : ""}
									</p>

									{/* Status breakdown */}
									<div className="flex flex-wrap gap-1.5">
										{["todo", "in-progress", "done"].map((s) =>
											counts[s] ? (
												<span
													key={s}
													className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[s]}`}
												>
													{counts[s]} {statusLabel[s]}
												</span>
											) : null,
										)}
									</div>

									{/* Assignee avatars preview */}
									{group.tasks.length > 0 && (
										<div className="mt-4 pt-3 border-t flex items-center gap-1.5">
											<div className="flex -space-x-2">
												{[...new Map(
													group.tasks
														.filter((t) => t.assignedTo)
														.map((t) => [t.assignedTo._id, t.assignedTo]),
												).values()]
													.slice(0, 4)
													.map((u) => (
														<div
															key={u._id}
															title={u.full_name}
															className="h-6 w-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] font-semibold text-primary"
														>
															{u.full_name?.charAt(0).toUpperCase()}
														</div>
													))}
											</div>
											{[...new Set(group.tasks.filter((t) => t.assignedTo).map((t) => t.assignedTo._id))].length > 4 && (
												<span className="text-xs text-muted-foreground">
													+{[...new Set(group.tasks.filter((t) => t.assignedTo).map((t) => t.assignedTo._id))].length - 4} more
												</span>
											)}
										</div>
									)}
								</button>
							);
						})}
					</div>
				)}
			</div>

			{/* Create Task Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Create New Task</DialogTitle>
						<DialogDescription>
							Fill in the details and choose how to assign this task.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4 pt-1">
						{/* Title */}
						<div className="space-y-1.5">
							<Label>Task Title <span className="text-destructive">*</span></Label>
							<Input
								value={formData.title}
								onChange={(e) => setFormData({ ...formData, title: e.target.value })}
								required
							/>
						</div>

						{/* Description */}
						<div className="space-y-1.5">
							<Label>Description</Label>
							<Textarea
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								className="resize-none"
								rows={3}
							/>
						</div>

						{/* Status + Priority + Due date */}
						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-1.5">
								<Label>Status</Label>
								<Select
									value={formData.status}
									onValueChange={(v) => setFormData({ ...formData, status: v })}
								>
									<SelectTrigger><SelectValue /></SelectTrigger>
									<SelectContent>
										<SelectItem value="todo">To Do</SelectItem>
										<SelectItem value="in-progress">In Progress</SelectItem>
										<SelectItem value="done">Done</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label>Priority</Label>
								<Select
									value={formData.priority}
									onValueChange={(v) => setFormData({ ...formData, priority: v })}
								>
									<SelectTrigger><SelectValue /></SelectTrigger>
									<SelectContent>
										<SelectItem value="High" className="text-red-600 font-bold">High</SelectItem>
										<SelectItem value="Medium" className="text-amber-600 font-bold">Medium</SelectItem>
										<SelectItem value="Low" className="text-emerald-600 font-bold">Low</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label>Due Date</Label>
								<Input
									type="date"
									value={formData.dueDate}
									onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
								/>
							</div>
						</div>

						{/* Project */}
						<div className="space-y-1.5">
							<Label>Project <span className="text-destructive">*</span></Label>
							<Select
								value={formData.projectId}
								onValueChange={(v) => setFormData({ ...formData, projectId: v })}
							>
								<SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
								<SelectContent>
									{projects.map((p) => (
										<SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Assignment mode */}
						<div className="space-y-3">
							<Label>Assign To</Label>
							<Tabs value={assignMode} onValueChange={setAssignMode}>
								<TabsList className="w-full">
									<TabsTrigger value="single" className="flex-1 gap-1.5">
										<UserIcon className="h-3.5 w-3.5" /> Single Member
									</TabsTrigger>
									<TabsTrigger value="team" className="flex-1 gap-1.5">
										<UsersIcon className="h-3.5 w-3.5" /> Entire Team
									</TabsTrigger>
								</TabsList>
							</Tabs>

							{/* Single: only show members from the selected project's team */}
							{assignMode === "single" && (
								<>
									{!formData.projectId ? (
										<p className="text-sm text-muted-foreground rounded-md border px-3 py-2">
											Select a project first to see available members.
										</p>
									) : projectTeamMembers.length === 0 ? (
										<p className="text-sm text-muted-foreground rounded-md border px-3 py-2">
											No team members found for this project's team.
										</p>
									) : (
										<Select
											value={formData.assignedTo}
											onValueChange={(v) => setFormData({ ...formData, assignedTo: v })}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a member" />
											</SelectTrigger>
											<SelectContent>
												{projectTeamMembers.map((u) => (
													<SelectItem key={u._id} value={u._id}>
														{u.full_name}
														{u.job_title && (
															<span className="ml-1.5 text-muted-foreground text-xs">· {u.job_title}</span>
														)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								</>
							)}

							{/* Team: pick a team then check members */}
							{assignMode === "team" && (
								<div className="space-y-3">
									<Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
										<SelectTrigger>
											<SelectValue placeholder="Select a team" />
										</SelectTrigger>
										<SelectContent>
											{teams.map((t) => (
												<SelectItem key={t._id} value={t._id}>
													{t.name}{" "}
													<span className="text-muted-foreground">
														({t.members?.length || 0} members)
													</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									{selectedTeamId && (
										<div className="rounded-md border">
											<div className="flex items-center justify-between border-b px-3 py-2 bg-muted/40">
												<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
													Team Members
												</span>
												<button
													type="button"
													className="text-xs text-primary hover:underline"
													onClick={() => {
														const allIds = teamMembers.map((m) => m._id);
														const allSelected = allIds.every((id) => selectedMemberIds.includes(id));
														setSelectedMemberIds(allSelected ? [] : allIds);
													}}
												>
													{teamMembers.every((m) => selectedMemberIds.includes(m._id))
														? "Deselect all"
														: "Select all"}
												</button>
											</div>
											{teamMembers.length === 0 ? (
												<p className="text-sm text-muted-foreground text-center py-4">
													This team has no members
												</p>
											) : (
												<div className="divide-y max-h-48 overflow-y-auto">
													{teamMembers.map((member) => (
														<label
															key={member._id}
															className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent transition-colors"
														>
															<Checkbox
																checked={selectedMemberIds.includes(member._id)}
																onCheckedChange={() => toggleMember(member._id)}
															/>
															<div className="min-w-0">
																<p className="text-sm font-medium truncate">{member.full_name}</p>
																<p className="text-xs text-muted-foreground truncate">{member.email}</p>
															</div>
															{member.job_title && (
																<span className="ml-auto text-xs text-muted-foreground shrink-0">
																	{member.job_title}
																</span>
															)}
														</label>
													))}
												</div>
											)}
											{selectedMemberIds.length > 0 && (
												<div className="border-t px-3 py-2 bg-muted/40">
													<p className="text-xs text-muted-foreground">
														<span className="font-medium text-foreground">{selectedMemberIds.length}</span> member{selectedMemberIds.length !== 1 ? "s" : ""} selected —{" "}
														<span className="font-medium text-foreground">{selectedMemberIds.length}</span> task{selectedMemberIds.length !== 1 ? "s" : ""} will be created
													</p>
												</div>
											)}
										</div>
									)}
								</div>
							)}
						</div>

						<Button type="submit" className="w-full" disabled={saving}>
							{saving
								? "Creating…"
								: assignMode === "team"
									? `Create ${selectedMemberIds.length || ""} Task${selectedMemberIds.length !== 1 ? "s" : ""}`
									: "Create Task"}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
