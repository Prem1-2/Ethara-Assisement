// ── Project detail view ───────────────────────────────────────────────────────
import {useEffect, useState} from "react";
import {get_admin_progress_api} from "../../../../api/api.js";
import {AlertTriangleIcon, CalendarIcon, CheckCircle2Icon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, ListTodoIcon, MessageSquareIcon} from "lucide-react";
import {Button} from "../../../ui/button.jsx";
import {Badge} from "../../../ui/badge.jsx";
import {fmtDate, isOverdue, ProgressBar, StatPill} from "../../../../helpers/helper.js";
import {UpdatesPanel} from "./updatePanel.jsx";
import {MemberDetailDialog} from "./memberDetailDialog.jsx";

const STATUS_BADGE = { todo: "secondary", "in-progress": "default", done: "outline" };
const STATUS_LABEL = { todo: "To Do", "in-progress": "In Progress", done: "Done" };


export function ProjectDetailView({ projectId, onBack }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [expandedTask, setExpandedTask] = useState(null);
    const [activeMember, setActiveMember] = useState(null); // for member dialog

    useEffect(() => {
        setLoading(true);
        get_admin_progress_api({ projectId })
            .then(setData)
            .catch(() => toast.error("Failed to load project progress"))
            .finally(() => setLoading(false));
    }, [projectId]);

    const project = data?.project;
    const projectStats = data?.projectStats || {};
    const memberProgress = data?.memberProgress || [];

    const selectedMemberData = selectedMemberId
        ? memberProgress.find((m) => m.member._id === selectedMemberId)
        : null;

    return (
        <div className="space-y-5">
            {/* Back + header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
                    <ChevronLeftIcon className="h-4 w-4" /> All Projects
                </Button>
                <div className="h-4 w-px bg-border" />
                {loading ? (
                    <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                ) : (
                    <div>
                        <h2 className="text-lg font-semibold leading-none">{project?.name}</h2>
                        {project?.team && (
                            <p className="text-xs text-muted-foreground mt-0.5">Team: {project.team.name}</p>
                        )}
                    </div>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
                    ))}
                </div>
            ) : (
                <>
                    {/* Project stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {[
                            { label: "Total", value: projectStats.total || 0, color: "text-foreground" },
                            { label: "To Do", value: projectStats.todo || 0, color: "text-blue-500" },
                            { label: "In Progress", value: projectStats.inProgress || 0, color: "text-yellow-500" },
                            { label: "Done", value: projectStats.done || 0, color: "text-green-500" },
                            { label: "Overdue", value: projectStats.overdue || 0, color: "text-destructive" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="rounded-lg border p-3 text-center">
                                <p className="text-xs text-muted-foreground">{label}</p>
                                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Completion bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Project completion</span>
                            <span className="font-semibold">{projectStats.completionRate || 0}%</span>
                        </div>
                        <ProgressBar value={projectStats.completionRate || 0} />
                    </div>

                    {/* Member list + task detail split */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Member list */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Members ({memberProgress.length})
                            </p>
                            {memberProgress.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No tasks assigned yet.</p>
                            ) : (
                                memberProgress.map(({ member, stats }) => {
                                    const rate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
                                    const active = selectedMemberId === member._id;
                                    return (
                                        <button
                                            key={member._id}
                                            type="button"
                                            onClick={() => setSelectedMemberId(active ? null : member._id)}
                                            className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${active ? "border-primary bg-accent" : ""}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{member.full_name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{member.job_title}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                                                    <span className="text-xs font-semibold">{rate}%</span>
                                                    {stats.overdue > 0 && (
                                                        <span className="flex items-center gap-0.5 text-xs text-destructive">
															<AlertTriangleIcon className="h-3 w-3" />{stats.overdue}
														</span>
                                                    )}
                                                </div>
                                            </div>
                                            <ProgressBar value={rate} />
                                            <div className="flex gap-3 mt-2">
                                                <StatPill icon={ListTodoIcon} label="Todo" value={stats.todo} color="text-blue-500" />
                                                <StatPill icon={ClockIcon} label="WIP" value={stats.inProgress} color="text-yellow-500" />
                                                <StatPill icon={CheckCircle2Icon} label="Done" value={stats.done} color="text-green-500" />
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* Task detail for selected member */}
                        <div className="lg:col-span-2">
                            {!selectedMemberId ? (
                                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground h-full flex items-center justify-center">
                                    Select a member to see their tasks and daily updates
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {selectedMemberData?.member.full_name}'s Tasks
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => setActiveMember(selectedMemberId)}
                                        >
                                            Full Profile
                                        </Button>
                                    </div>
                                    {selectedMemberData?.tasks.map((task) => {
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
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Full member profile dialog */}
            <MemberDetailDialog
                memberId={activeMember}
                open={!!activeMember}
                onClose={() => setActiveMember(null)}
            />
        </div>
    );
}
