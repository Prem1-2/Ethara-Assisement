export function fmtDate(d) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
export function fmtTime(d) {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
export function ProgressBar({ value, className = "" }) {
    return (
        <div className={`h-2 w-full rounded-full bg-muted overflow-hidden ${className}`}>
            <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, value)}%` }}
            />
        </div>
    );
}
export function isOverdue(task) {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
}


export function StatPill({ icon: Icon, label, value, color }) {
    return (
        <div className="flex items-center gap-1.5 text-xs">
            <Icon className={`h-3.5 w-3.5 ${color}`} />
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}
