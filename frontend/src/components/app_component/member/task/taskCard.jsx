import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderIcon } from "lucide-react";
import { MessageSquarePlusIcon } from "lucide-react";
import { AlertTriangleIcon } from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

function isOverdue(task) {
	return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
}
function formatDate(d) {
	if (!d) return null;
	return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
export function TaskCard({ task, onStatusChange, onOpenDetail }) {
    
	const overdue = isOverdue(task);
	const [updating, setUpdating] = useState(false);

	const handleStatus = async (newStatus) => {
		setUpdating(true);
		try {
			await onStatusChange(task._id, newStatus);
		} finally {
			setUpdating(false);
		}
	};

	return (
		<div
			className="rounded-lg border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow cursor-pointer"
			onClick={() => onOpenDetail(task)}
		>
			{/* Title + overdue */}
			<div className="flex items-start justify-between gap-2">
				<p className="text-sm font-medium leading-snug">{task.title}</p>
				{overdue && (
					<AlertTriangleIcon className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
				)}
			</div>

			{/* Project */}
			{task.projectId && (
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<FolderIcon className="h-3.5 w-3.5" />
					{task.projectId.name}
				</div>
			)}

			{/* Due date */}
			{task.dueDate && (
				<div className={`flex items-center gap-1.5 text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
					<CalendarIcon className="h-3.5 w-3.5" />
					{overdue ? "Overdue · " : ""}{formatDate(task.dueDate)}
				</div>
			)}

			{/* Updates count */}
			{task.updates?.length > 0 && (
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<MessageSquarePlusIcon className="h-3.5 w-3.5" />
					{task.updates.length} update{task.updates.length !== 1 ? "s" : ""}
				</div>
			)}

			{/* Status selector — stop propagation so click doesn't open detail */}
			<div onClick={(e) => e.stopPropagation()}>
				<Select value={task.status} onValueChange={handleStatus} disabled={updating}>
					<SelectTrigger className="h-7 text-xs w-full">
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
	);
}