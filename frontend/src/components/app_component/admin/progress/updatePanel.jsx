import {fmtDate, fmtTime} from "../../../../helpers/helper.js";

export function UpdatesPanel({ updates }) {
    if (!updates?.length) {
        return <p className="text-xs text-muted-foreground italic">No updates posted yet.</p>;
    }
    return (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {[...updates].reverse().map((u, i) => (
                <div key={i} className="rounded-md border bg-muted/40 px-3 py-2">
                    <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium">{u.postedBy?.full_name || "Member"}</span>
                        <span className="text-xs text-muted-foreground">
							{fmtDate(u.createdAt)} · {fmtTime(u.createdAt)}
						</span>
                    </div>
                    <p className="text-sm leading-relaxed">{u.note}</p>
                </div>
            ))}
        </div>
    );
}
