"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const members = [
	{ name: "Amit Verma", status: "Online", online: true, role: "Senior Annotator" },
	{ name: "Priya Sharma", status: "Online", online: true, role: "AI Reviewer" },
	{ name: "Rahul Kumar", status: "Offline", online: false, role: "Data Engineer" },
];

export function TeamMembersWidget() {
	return (
		<div className="flex flex-col gap-6 p-6 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all h-full">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Team Members</h3>
				<span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 border border-emerald-100">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
					2 Online
				</span>
			</div>
			
			<div className="space-y-4">
				{members.map((member) => (
					<div key={member.name} className="flex items-center justify-between p-2 rounded-2xl hover:bg-muted/30 transition-all group">
						<div className="flex items-center gap-3">
							<div className="relative">
								<Avatar className="size-10 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
									<AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
										{member.name.split(" ").map(n => n[0]).join("")}
									</AvatarFallback>
								</Avatar>
								<div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${member.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
							</div>
							<div className="space-y-0.5">
								<p className="text-sm font-bold text-foreground leading-none">{member.name}</p>
								<p className="text-[10px] font-bold text-muted-foreground/60">{member.status}</p>
							</div>
						</div>
						<button className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
							<svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
						</button>
					</div>
				))}
			</div>
			
			<button className="text-xs font-bold text-primary hover:underline text-center pt-2">View all members →</button>
		</div>
	);
}
