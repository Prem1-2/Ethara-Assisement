import {useEffect, useState} from "react";
import {toast} from "sonner";
import {
    AlertTriangleIcon, CalendarIcon,
    CheckCircle2Icon,
    ChevronRightIcon,
    ClockIcon,
    ListTodoIcon,
    MessageSquareIcon
} from "lucide-react";
import {get_admin_progress_api} from "@/api/api.js";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog.jsx";
import {UpdatesPanel} from "@/components/app_component/admin/progress/updatePanel.jsx";
import {ProgressBar} from "@/helpers/helper.js";

const STATUS_BADGE = { todo: "secondary", "in-progress": "default", done: "outline" };
const STATUS_LABEL = { todo: "To Do", "in-progress": "In Progress", done: "Done" };

export function MemberDetailDialog({ memberId, open, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expandedTask, setExpandedTask] = useState(null);

    useEffect(() => {
        if (!open || !memberId) return;
        setLoading(true);
        setExpandedTask(null);
        get_admin_progress_api({ memberId })
            .then(setData)
            .catch(() => toast.error("Failed to load member progress"))
            .finally(() => setLoading(false));
    }, [open, memberId]);

    const member = data?.member;
    const stats = data?.stats || {};
    const tasks = data?.tasks || [];

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{member?.full_name || "Member Progress"}</DialogTitle>
                    <DialogDescription>
                        {member?.job_title} · {member?.department}
                        {member?.teamId && <> · Team: <strong>{member.teamId.name}</strong></>}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Stats row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { icon: ListTodoIcon, label: "To Do", value: stats.todo || 0, color: "text-blue-500" },
                                { icon: ClockIcon, label: "In Progress", value: stats.inProgress || 0, color: "text-yellow-500" },
                                { icon: CheckCircle2Icon, label: "Done", value: stats.done || 0, color: "text-green-500" },
                                { icon: AlertTriangleIcon, label: "Overdue", value: stats.overdue || 0, color: "text-destructive" },
                            ].map(({ icon, label, value, color }) => (
                                <div key={label} className="rounded-lg border p-3 text-center">
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Completion bar */}
                        {stats.total > 0 && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Overall completion</span>
                                    <span className="font-medium text-foreground">
										{Math.round((stats.done / stats.total) * 100)}%
									</span>
                                </div>
                                <ProgressBar value={Math.round((stats.done / stats.total) * 100)} />
                            </div>
                        )}

                        {/* Task list */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                Tasks ({tasks.length})
                            </p>
                            <div className="space-y-2">
                                {tasks.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No tasks assigned.</p>
                                ) : (
                                    tasks.map((task) => {
                                        const overdue = isOverdue(task);
                                        const expanded = expandedTask === task._id;
                                        return (
                                            <div key={task._id} className="rounded-lg border overflow-hidden">
                                                <button
                                                    type="button"
                                                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent text-left transition-colors"
                                                    onClick={() => setExpandedTask(expanded ? null : task._id)}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {overdue && <AlertTriangleIcon className="h-3.5 w-3.5 text-destructive shrink-0" />}
                                                        <span className="text-sm font-medium truncate">{task.title}</span>
                                                        {task.projectId && (
                                                            <span className="text-xs text-muted-foreground shrink-0">
																· {task.projectId.name}
															</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {task.updates?.length > 0 && (
                                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
																<MessageSquareIcon className="h-3 w-3" />
                                                                {task.updates.length}
															</span>
                                                        )}
                                                        <Badge variant={STATUS_BADGE[task.status]} className="text-xs">
                                                            {STATUS_LABEL[task.status]}
                                                        </Badge>
                                                        <ChevronRightIcon className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
                                                    </div>
                                                </button>

                                                {expanded && (
                                                    <div className="border-t px-4 py-3 bg-muted/20 space-y-3">
                                                        {task.description && (
                                                            <p className="text-sm text-muted-foreground">{task.description}</p>
                                                        )}
                                                        {task.dueDate && (
                                                            <div className={`flex items-center gap-1.5 text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                                                                <CalendarIcon className="h-3.5 w-3.5" />
                                                                {overdue ? "Overdue · " : "Due: "}{fmtDate(task.dueDate)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                                                Daily Updates
                                                            </p>
                                                            <UpdatesPanel updates={task.updates} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
