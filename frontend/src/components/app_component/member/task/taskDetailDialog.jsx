"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, FolderIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import { update_member_task_api } from "@/api/api";

// ── Constants ────────────────────────────────────────────────────────────────
const STATUS_BADGE = {
	todo: "secondary",
	"in-progress": "default",
	done: "outline",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function isOverdue(task) {
	return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
}

function formatDate(d) {
	if (!d) return null;
	return new Date(d).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

// ── Component ────────────────────────────────────────────────────────────────
export function TaskDetailDialog({ task, open, onClose, onStatusChange, onNoteAdded }) {
	const [note, setNote] = useState("");
	const [posting, setPosting] = useState(false);
	const [statusUpdating, setStatusUpdating] = useState(false);

	if (!task) return null;

	const overdue = isOverdue(task);

	const handlePostNote = async () => {
		if (!note.trim()) return;
		setPosting(true);
		try {
			const updated = await update_member_task_api(task._id, { note: note.trim() });
			onNoteAdded(updated.task);
			setNote("");
			toast.success("Update posted");
		} catch {
			toast.error("Failed to post update");
		} finally {
			setPosting(false);
		}
	};

	const handleStatus = async (newStatus) => {
		setStatusUpdating(true);
		try {
			await onStatusChange(task._id, newStatus);
		} finally {
			setStatusUpdating(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="leading-snug pr-6">{task.title}</DialogTitle>
					<DialogDescription asChild>
						<div className="flex flex-wrap items-center gap-2 mt-1">
							<Badge variant={STATUS_BADGE[task.status]}>{task.status}</Badge>
							{task.projectId && (
								<span className="flex items-center gap-1 text-xs text-muted-foreground">
									<FolderIcon className="h-3 w-3" />
									{task.projectId.name}
								</span>
							)}
							{task.dueDate && (
								<span
									className={`flex items-center gap-1 text-xs ${
										overdue ? "text-destructive" : "text-muted-foreground"
									}`}
								>
									<CalendarIcon className="h-3 w-3" />
									{overdue ? "Overdue · " : ""}
									{formatDate(task.dueDate)}
								</span>
							)}
						</div>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 pt-1">
					{/* Description */}
					{task.description && (
						<div>
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
								Description
							</p>
							<p className="text-sm leading-relaxed">{task.description}</p>
						</div>
					)}

					{/* Status */}
					<div>
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
							Status
						</p>
						<Select value={task.status} onValueChange={handleStatus} disabled={statusUpdating}>
							<SelectTrigger className="w-44">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="todo">To Do</SelectItem>
								<SelectItem value="in-progress">In Progress</SelectItem>
								<SelectItem value="done">Done</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Daily update */}
					<div>
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
							Post a Daily Update
						</p>
						<Textarea
							placeholder="What did you work on today? Any blockers?"
							value={note}
							onChange={(e) => setNote(e.target.value)}
							className="min-h-[72px] resize-none text-sm"
							onKeyDown={(e) => {
								if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePostNote();
							}}
						/>
						<Button
							size="sm"
							className="mt-2"
							onClick={handlePostNote}
							disabled={posting || !note.trim()}
						>
							<SendIcon className="h-3.5 w-3.5 mr-1.5" />
							{posting ? "Posting..." : "Post Update"}
						</Button>
						<p className="text-xs text-muted-foreground mt-1">Tip: Ctrl+Enter to submit</p>
					</div>

					{/* Update log */}
					{task.updates?.length > 0 && (
						<div>
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
								Update Log ({task.updates.length})
							</p>
							<div className="space-y-2 max-h-56 overflow-y-auto pr-1">
								{[...task.updates].reverse().map((u, i) => (
									<div key={i} className="rounded-md border bg-muted/40 px-3 py-2.5">
										<div className="flex items-center justify-between mb-1">
											<span className="text-xs font-medium">
												{u.postedBy?.full_name || "You"}
											</span>
											<span className="text-xs text-muted-foreground">
												{new Date(u.createdAt).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
												})}{" "}
												{new Date(u.createdAt).toLocaleTimeString("en-US", {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
										<p className="text-sm leading-relaxed">{u.note}</p>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
