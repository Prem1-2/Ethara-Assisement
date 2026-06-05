"use client";
import { useEffect, useState, useCallback } from "react";
import { get_member_tasks_api, update_member_task_api } from "@/api/api";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ListTodoIcon,
	ClockIcon,
	CheckCircle2Icon,
	CalendarIcon,
	FolderIcon,
	MessageSquarePlusIcon,
	SearchIcon,
	AlertTriangleIcon,
	SendIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { TaskCard } from "@/components/app_component/member/task/taskCard";
import { TaskDetailDialog } from "@/components/app_component/member/task/taskDetailDialog";

// ── Constants ────────────────────────────────────────────────────────────────

const STATUSES = [
	{ key: "todo", label: "To Do", icon: ListTodoIcon, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
	{ key: "in-progress", label: "In Progress", icon: ClockIcon, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-800" },
	{ key: "done", label: "Done", icon: CheckCircle2Icon, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800" },
];

const STATUS_BADGE = {
	todo: "secondary",
	"in-progress": "default",
	done: "outline",
};

function formatDate(d) {
	if (!d) return null;
	return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(task) {
	return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
}

export default function MemberTasksPage() {
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [selectedTask, setSelectedTask] = useState(null);
	const [view, setView] = useState("kanban"); // "kanban" | "list"

	const fetchTasks = useCallback(async () => {
		setLoading(true);
		try {
			const data = await get_member_tasks_api();
			setTasks(data.tasks);
		} catch {
			toast.error("Failed to load tasks");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchTasks();
		if (typeof window !== "undefined") {
			const query = new URLSearchParams(window.location.search).get("search");
			if (query) {
				setSearch(query);
			}
		}
	}, [fetchTasks]);

	const handleStatusChange = useCallback(async (taskId, newStatus) => {
		try {
			const data = await update_member_task_api(taskId, { status: newStatus });
			setTasks((prev) => prev.map((t) => t._id === taskId ? data.task : t));
			// keep detail dialog in sync
			setSelectedTask((prev) => prev?._id === taskId ? data.task : prev);
			toast.success("Status updated");
		} catch {
			toast.error("Failed to update status");
		}
	}, []);

	const handleNoteAdded = useCallback((updatedTask) => {
		setTasks((prev) => prev.map((t) => t._id === updatedTask._id ? updatedTask : t));
		setSelectedTask(updatedTask);
	}, []);

	// Filter
	const filtered = tasks.filter((t) => {
		if (!debouncedSearch) return true;
		const q = debouncedSearch.toLowerCase();
		return (
			t.title.toLowerCase().includes(q) ||
			t.projectId?.name?.toLowerCase().includes(q) ||
			t.description?.toLowerCase().includes(q)
		);
	});

	const byStatus = (status) => filtered.filter((t) => t.status === status);
	const overdueCount = tasks.filter(isOverdue).length;

	return (
		<>
			<SiteHeader title="My Tasks" />
			<div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">

				{/* Toolbar */}
				<div className="flex flex-wrap items-center gap-3">
					<div className="relative flex-1 min-w-[200px] max-w-sm">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search tasks..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9"
						/>
					</div>

					{overdueCount > 0 && (
						<div className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-1.5 text-xs text-destructive font-medium">
							<AlertTriangleIcon className="h-3.5 w-3.5" />
							{overdueCount} overdue
						</div>
					)}

					<div className="ml-auto flex items-center gap-1 rounded-md border p-1">
						<Button
							variant={view === "kanban" ? "secondary" : "ghost"}
							size="sm"
							className="h-7 px-3 text-xs"
							onClick={() => setView("kanban")}
						>
							Board
						</Button>
						<Button
							variant={view === "list" ? "secondary" : "ghost"}
							size="sm"
							className="h-7 px-3 text-xs"
							onClick={() => setView("list")}
						>
							List
						</Button>
					</div>
				</div>

				{/* Kanban view */}
				{view === "kanban" && (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{STATUSES.map(({ key, label, icon: Icon, color, bg, border }) => {
							const col = byStatus(key);
							return (
								<div key={key} className={`rounded-xl border ${border} ${bg} p-3 space-y-3`}>
									{/* Column header */}
									<div className="flex items-center justify-between px-1">
										<div className="flex items-center gap-2">
											<Icon className={`h-4 w-4 ${color}`} />
											<span className="text-sm font-semibold">{label}</span>
										</div>
										<Badge variant="secondary" className="text-xs">{col.length}</Badge>
									</div>

									{/* Cards */}
									{loading ? (
										Array.from({ length: 2 }).map((_, i) => (
											<div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
										))
									) : col.length === 0 ? (
										<div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
											No tasks
										</div>
									) : (
										col.map((task) => (
											<TaskCard
												key={task._id}
												task={task}
												onStatusChange={handleStatusChange}
												onOpenDetail={setSelectedTask}
											/>
										))
									)}
								</div>
							);
						})}
					</div>
				)}

				{/* List view */}
				{view === "list" && (
					<div className="rounded-lg border bg-card divide-y">
						{loading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="flex items-center gap-4 p-4">
									<div className="h-4 flex-1 animate-pulse rounded bg-muted" />
									<div className="h-4 w-24 animate-pulse rounded bg-muted" />
								</div>
							))
						) : filtered.length === 0 ? (
							<div className="p-8 text-center text-sm text-muted-foreground">No tasks found</div>
						) : (
							filtered.map((task) => {
								const overdue = isOverdue(task);
								return (
									<div
										key={task._id}
										className="flex items-center gap-4 p-4 hover:bg-accent cursor-pointer transition-colors"
										onClick={() => setSelectedTask(task)}
									>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<p className="text-sm font-medium truncate">{task.title}</p>
												{overdue && <AlertTriangleIcon className="h-3.5 w-3.5 text-destructive shrink-0" />}
											</div>
											{task.projectId && (
												<p className="text-xs text-muted-foreground truncate">{task.projectId.name}</p>
											)}
										</div>
										<div className="flex items-center gap-3 shrink-0">
											{task.dueDate && (
												<span className={`text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
													{formatDate(task.dueDate)}
												</span>
											)}
											{task.updates?.length > 0 && (
												<span className="flex items-center gap-1 text-xs text-muted-foreground">
													<MessageSquarePlusIcon className="h-3 w-3" />{task.updates.length}
												</span>
											)}
											<Badge variant={STATUS_BADGE[task.status]} className="text-xs">
												{task.status}
											</Badge>
											<div onClick={(e) => e.stopPropagation()}>
												<Select value={task.status} onValueChange={(v) => handleStatusChange(task._id, v)}>
													<SelectTrigger className="h-7 w-32 text-xs">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="todo">To Do</SelectItem>
														<SelectItem value="in-progress">In Progress</SelectItem>
														<SelectItem value="done">Done</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>
								);
							})
						)}
					</div>
				)}
			</div>

			{/* Task detail dialog */}
			<TaskDetailDialog
				task={selectedTask}
				open={!!selectedTask}
				onClose={() => setSelectedTask(null)}
				onStatusChange={handleStatusChange}
				onNoteAdded={handleNoteAdded}
			/>
		</>
	);
}
