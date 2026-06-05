"use client";

import { Upload, Send, MessageSquare, BookOpen } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { toast } from "sonner";

export function QuickActions() {
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef(null);

	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setIsUploading(true);
		toast.info(`Uploading ${file.name}...`);
		
		setTimeout(() => {
			setIsUploading(false);
			toast.success(`${file.name} uploaded! Admin notified.`);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}, 2000);
	};

	const actions = [
		{ name: "Upload File", icon: Upload, color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", onClick: () => fileInputRef.current?.click() },
		{ name: "Submit Work", icon: Send, color: "bg-purple-500", light: "bg-purple-50", text: "text-purple-700", href: "/member/tasks" },
		{ name: "Ask Question", icon: MessageSquare, color: "bg-blue-500", light: "bg-blue-50", text: "text-blue-700", href: "/member/messages" },
		{ name: "View Guidelines", icon: BookOpen, color: "bg-orange-500", light: "bg-orange-50", text: "text-orange-700", href: "/member/tasks" },
	];

	return (
		<div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all h-full">
			<h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Quick Actions</h3>
			
			<input 
				type="file" 
				className="hidden" 
				ref={fileInputRef} 
				onChange={handleFileSelect}
			/>

			<div className="grid grid-cols-2 gap-3">
				{actions.map((action) => (
					action.href ? (
						<Link
							key={action.name}
							href={action.href}
							className={`flex flex-col items-center gap-2 p-3 rounded-xl ${action.light} border border-transparent hover:border-current/10 transition-all hover:-translate-y-0.5`}
						>
							<div className={`p-2 rounded-lg ${action.color} text-white shadow-md shadow-current/10`}>
								<action.icon className="size-4" />
							</div>
							<span className={`text-[10px] font-bold ${action.text}`}>{action.name}</span>
						</Link>
					) : (
						<button
							key={action.name}
							onClick={action.onClick}
							disabled={isUploading}
							className={`flex flex-col items-center gap-2 p-3 rounded-xl ${action.light} border border-transparent hover:border-current/10 transition-all hover:-translate-y-0.5 disabled:opacity-50`}
						>
							<div className={`p-2 rounded-lg ${action.color} text-white shadow-md shadow-current/10`}>
								{isUploading && action.name === "Upload File" ? (
									<div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
								) : (
									<action.icon className="size-4" />
								)}
							</div>
							<span className={`text-[10px] font-bold ${action.text}`}>{isUploading && action.name === "Upload File" ? "Uploading..." : action.name}</span>
						</button>
					)
				))}
			</div>
		</div>
	);
}
