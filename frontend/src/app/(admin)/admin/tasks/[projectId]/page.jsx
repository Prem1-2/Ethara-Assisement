"use client";
import { SiteHeader } from "@/components/site-header";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	get_tasks_api,
	get_project_api,
	get_teams_api,
	update_task_api,
	delete_task_api,
	create_task_api,
} from "@/api/api";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
	ArrowLeftIcon,
	EditIcon,
	Trash2Icon,
	PlusIcon,
	FolderKanbanIcon,
	UsersIcon,
	EyeIcon,
	ClockIcon,
	UserIcon,
} from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = {
	title: "",
	description: "",
	status: "todo",
	assignedTo: "",
	dueDate: "",
};

export default function ProjectTasksPage() {
	const { projectId } = useParams();
	const router = useRouter();

	const [tasks, setTasks] = useState([]);
	const [project, setProject] = useState(null);
	const [teamMembers, setTeamMembers] = useState([]);
	const [loading, setLoading] = useState(true);

	// Dialog
	const [dialogOpen, setDialogOpen] = useState(false);
	const [viewingTask, setViewingTask] = useState(null);
	const [editingTask, setEditingTask] = useState(null);
	const [formData, setFormData] = useState(EMPTY_FORM);
	const [saving, setSaving] = useState(false);

	// ── Fetch project + its team members ─────────────────────────────────────
	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			const [tasksData, projectData, teamsData] = await Promise.all([
				get_tasks_api({ projectId }),
				get_project_api(projectId),
				get_teams_api(),
			]);

			setTasks(tasksData.tasks);
			setProject(projectData.project);

			// Find the team that belongs to this project
			const projectTeamId = projectData.project?.teamId?._id || projectData.project?.teamId;
			const team = teamsData.teams.find((t) => t._id === projectTeamId);
			setTeamMembers(team?.members || []);
		} catch {
			toast.error("Failed to load project tasks");
		} finally {
			setLoading(false);
		}
	}, [projectId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// ── Dialog helpers ────────────────────────────────────────────────────────
	const openCreate = () => {
		setEditingTask(null);
		setFormData(EMPTY_FORM);
		setDialogOpen(true);
	};

	const openEdit = (task) => {
		setEditingTask(task);
		setFormData({
			title: task.title,
			description: task.description || "",
			status: task.status,
			assignedTo: task.assignedTo?._id || "",
			dueDate: task.dueDate
				? new Date(task.dueDate).toISOString().split("T")[0]
				: "",
		});
		setDialogOpen(true);
	};

	// ── Submit ────────────────────────────────────────────────────────────────
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.assignedTo) return toast.error("Select a team member to assign");

		setSaving(true);
		try {
			if (editingTask) {
				await update_task_api(editingTask._id, formData);
				toast.success("Task updated");
			} else {
				await create_task_api({ ...formData, projectId });
				toast.success("Task created");
			}
			setDialogOpen(false);
			fetchData();
		} catch (err) {
			toast.error(err.response?.data?.error || "Failed to save task");
		} finally {
			setSaving(false);
		}
	};

	// ── Delete ────────────────────────────────────────────────────────────────
	const handleDelete = async (id) => {
		if (!confirm("Delete this task?")) return;
		try {
			await delete_task_api(id);
			toast.success("Task deleted");
			fetchData();
		} catch {
			toast.error("Failed to delete task");
		}
	};

	// ── Status badge ──────────────────────────────────────────────────────────
	const statusBadge = (s) => {
		const variants = { todo: "secondary", "in-progress": "default", done: "outline" };
		const labels = { todo: "To Do", "in-progress": "In Progress", done: "Done" };
		return <Badge variant={variants[s]}>{labels[s]}</Badge>;
	};

	// ── Status counts ─────────────────────────────────────────────────────────
	const counts = tasks.reduce((acc, t) => {
		acc[t.status] = (acc[t.status] || 0) + 1;
		return acc;
	}, {});

	return (
		<>
			<SiteHeader title={project?.name || "Project Tasks"} />
			<div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">

				{/* Back + header */}
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => router.push("/admin/tasks")}
						>
							<ArrowLeftIcon className="h-4 w-4" />
						</Button>
						<div>
							<div className="flex items-center gap-2">
								<FolderKanbanIcon className="h-5 w-5 text-muted-foreground" />
								<h1 className="text-xl font-semibold">
									{loading ? (
										<span className="inline-block h-5 w-40 animate-pulse rounded bg-muted" />
									) : (
										project?.name || "Project Tasks"
									)}
								</h1>
							</div>
							{project?.teamId && (
								<div className="flex items-center gap-1.5 mt-1 ml-7">
									<UsersIcon className="h-3.5 w-3.5 text-muted-foreground" />
									<span className="text-xs text-muted-foreground">
										{project.teamId?.name || "—"} · {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""}
									</span>
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center gap-3">
						{/* Status summary pills */}
						{!loading && tasks.length > 0 && (
							<div className="hidden sm:flex items-center gap-2">
								{counts.todo > 0 && (
									<span className="text-xs rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-medium">
										{counts.todo} To Do
									</span>
								)}
								{counts["in-progress"] > 0 && (
									<span className="text-xs rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 font-medium">
										{counts["in-progress"]} In Progress
									</span>
								)}
								{counts.done > 0 && (
									<span className="text-xs rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2.5 py-1 font-medium">
										{counts.done} Done
									</span>
								)}
							</div>
						)}
						<Button onClick={openCreate} size="sm">
							<PlusIcon className="h-4 w-4 mr-1" /> Add Task
						</Button>
					</div>
				</div>

				{/* Tasks table */}
				<div className="rounded-lg border bg-card">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Assigned To</TableHead>
								<TableHead>Due Date</TableHead>
								<TableHead className="text-right pr-4">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<TableRow key={i}>
										{Array.from({ length: 5 }).map((__, j) => (
											<TableCell key={j}>
												<div className="h-4 w-full animate-pulse rounded bg-muted" />
											</TableCell>
										))}
									</TableRow>
								))
							) : tasks.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
										No tasks yet for this project.{" "}
										<button
											type="button"
											className="text-primary underline-offset-4 hover:underline"
											onClick={openCreate}
										>
											Add the first one
										</button>
									</TableCell>
								</TableRow>
							) : (
								tasks.map((task) => (
									<TableRow key={task._id}>
										<TableCell className="font-medium max-w-[240px] truncate">
											{task.title}
										</TableCell>
										<TableCell>{statusBadge(task.status)}</TableCell>
										<TableCell>
											{task.assignedTo?.full_name || (
												<span className="text-muted-foreground">Unassigned</span>
											)}
										</TableCell>
										<TableCell>
											{task.dueDate
												? new Date(task.dueDate).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
														year: "numeric",
												  })
												: <span className="text-muted-foreground">—</span>}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-1">
												<Button
													size="icon"
													variant="ghost"
													className="h-8 w-8 text-primary hover:text-primary"
													onClick={() => setViewingTask(task)}
													title="View Member Updates"
												>
													<EyeIcon className="h-4 w-4" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													className="h-8 w-8"
													onClick={() => openEdit(task)}
												>
													<EditIcon className="h-4 w-4" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													className="h-8 w-8 hover:text-destructive"
													onClick={() => handleDelete(task._id)}
												>
													<Trash2Icon className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Edit / Create Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>{editingTask ? "Edit Task" : "Add Task"}</DialogTitle>
						<DialogDescription>
							{editingTask
								? "Update the task details. Only team members of this project can be assigned."
								: "Create a new task for this project. Only team members can be assigned."}
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4 pt-1">
						{/* Title */}
						<div className="space-y-1.5">
							<Label>
								Task Title <span className="text-destructive">*</span>
							</Label>
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
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								className="resize-none"
								rows={3}
							/>
						</div>

						{/* Status + Due date */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<Label>Status</Label>
								<Select
									value={formData.status}
									onValueChange={(v) => setFormData({ ...formData, status: v })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="todo">To Do</SelectItem>
										<SelectItem value="in-progress">In Progress</SelectItem>
										<SelectItem value="done">Done</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label>Due Date</Label>
								<Input
									type="date"
									value={formData.dueDate}
									onChange={(e) =>
										setFormData({ ...formData, dueDate: e.target.value })
									}
								/>
							</div>
						</div>

						{/* Assign To — only team members */}
						<div className="space-y-1.5">
							<Label>
								Assign To <span className="text-destructive">*</span>
							</Label>
							{teamMembers.length === 0 ? (
								<p className="text-sm text-muted-foreground rounded-md border px-3 py-2">
									No team members found for this project's team.
								</p>
							) : (
								<Select
									value={formData.assignedTo}
									onValueChange={(v) =>
										setFormData({ ...formData, assignedTo: v })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a team member" />
									</SelectTrigger>
									<SelectContent>
										{teamMembers.map((u) => (
											<SelectItem key={u._id} value={u._id}>
												<span>{u.full_name}</span>
												{u.job_title && (
													<span className="ml-1.5 text-muted-foreground text-xs">
														· {u.job_title}
													</span>
												)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>

						<Button type="submit" className="w-full" disabled={saving}>
							{saving ? "Saving…" : editingTask ? "Update Task" : "Create Task"}
						</Button>
					</form>
				</DialogContent>
			</Dialog>

			{/* Member Updates Dialog */}
			<Dialog open={!!viewingTask} onOpenChange={() => setViewingTask(null)}>
				<DialogContent className="max-w-xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<ClockIcon className="size-5 text-primary" />
							Member Updates
						</DialogTitle>
						<DialogDescription>
							Review all notes and progress shared by members for: <span className="font-bold text-foreground">{viewingTask?.title}</span>
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
						{viewingTask?.updates?.length === 0 ? (
							<div className="text-center py-12 border-2 border-dashed rounded-2xl">
								<p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No updates yet</p>
							</div>
						) : (
							viewingTask?.updates?.map((update, idx) => (
								<div key={idx} className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
									<div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
										<UserIcon className="size-5 text-primary" />
									</div>
									<div className="space-y-1">
										<p className="text-sm font-bold text-foreground leading-tight">{update.note}</p>
										<div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
											<span>By Member</span>
											<span>·</span>
											<span>{new Date(update.createdAt).toLocaleString()}</span>
										</div>
									</div>
								</div>
							))
						)}
					</div>
					<Button onClick={() => setViewingTask(null)} variant="secondary" className="w-full rounded-xl">Close View</Button>
				</DialogContent>
			</Dialog>
		</>
	);
}
