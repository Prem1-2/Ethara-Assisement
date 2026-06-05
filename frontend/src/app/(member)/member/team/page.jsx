"use client";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UsersIcon, MailIcon, BriefcaseIcon, BuildingIcon, MessageSquareIcon, ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

export default function MemberTeamPage() {
	const [data, setData] = useState(null);
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTeamData = async () => {
			try {
				const [teamRes, meRes] = await Promise.all([
					axiosInstance.get("/member/team"),
					axiosInstance.get("/member/dashboard") // to get current user ID
				]);
				setData(teamRes.data);
				setCurrentUser(meRes.data.user);
			} catch (err) {
				console.error("Team Fetch Error:", err);
				toast.error("Failed to load team details");
			} finally {
				setLoading(false);
			}
		};

		fetchTeamData();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#fcfcfc] dark:bg-background">
				<SiteHeader title="My Team" />
				<div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
					<div className="h-32 animate-pulse rounded-2xl bg-muted/20 w-full mb-6" />
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="h-64 animate-pulse rounded-2xl bg-muted/20 col-span-1" />
						<div className="h-64 animate-pulse rounded-2xl bg-muted/20 col-span-2" />
					</div>
				</div>
			</div>
		);
	}

	if (!data || !data.team) {
		return (
			<div className="min-h-screen bg-[#fcfcfc] dark:bg-background">
				<SiteHeader title="My Team" />
				<div className="flex flex-1 flex-col items-center justify-center p-8 max-w-md mx-auto h-[70vh]">
					<div className="size-16 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center mb-4 text-amber-500">
						<ShieldAlertIcon className="size-8" />
					</div>
					<h2 className="text-lg font-bold text-foreground text-center">No Team Assigned</h2>
					<p className="text-xs text-muted-foreground text-center mt-2">
						You haven't been assigned to a team yet. Please contact your manager or system administrator to add you to a team.
					</p>
				</div>
			</div>
		);
	}

	const { team, members } = data;
	const manager = team.createdBy;

	const getInitials = (name) => {
		if (!name) return "";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	// Harmonious colors based on initials
	const getAvatarBg = (name) => {
		const colors = [
			"bg-rose-500/10 text-rose-600 dark:text-rose-400",
			"bg-blue-500/10 text-blue-600 dark:text-blue-400",
			"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
			"bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
			"bg-violet-500/10 text-violet-600 dark:text-violet-400",
			"bg-amber-500/10 text-amber-600 dark:text-amber-400",
		];
		const code = (name || "").charCodeAt(0) || 0;
		return colors[code % colors.length];
	};

	return (
		<div className="min-h-screen bg-[#fcfcfc] dark:bg-background">
			<SiteHeader title="My Team" />
			<div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
				
				{/* Team Hero Header */}
				<div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-r from-primary/5 via-violet-500/5 to-indigo-500/5 p-6 md:p-8 shadow-sm">
					<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div className="space-y-1">
							<div className="flex items-center gap-2.5">
								<div className="p-2 rounded-xl bg-primary/10 text-primary">
									<UsersIcon className="size-5" />
								</div>
								<h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{team.name}</h1>
							</div>
							<p className="text-xs text-muted-foreground font-medium pl-1">
								Teammates: <span className="font-bold text-foreground">{members.length} members</span>
							</p>
						</div>
						<div className="flex items-center gap-3">
							<span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider bg-muted/50 border border-border/50 px-3 py-1.5 rounded-xl">
								Created {new Date(team.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
							</span>
						</div>
					</div>
					<div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-primary/5 to-transparent pointer-events-none" />
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					
					{/* Team Leader/Manager Column */}
					<div className="space-y-4 col-span-1">
						<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Team Lead</h2>
						{manager ? (
							<Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card transition-all duration-300 hover:shadow-md">
								<CardHeader className="pb-4 border-b border-border/10">
									<div className="flex items-center gap-4">
										<div className={`size-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${getAvatarBg(manager.full_name)}`}>
											{getInitials(manager.full_name)}
										</div>
										<div className="min-w-0">
											<CardTitle className="text-sm font-bold truncate">{manager.full_name}</CardTitle>
											<CardDescription className="text-[10px] font-black text-primary uppercase tracking-widest truncate mt-0.5">
												Team Manager
											</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent className="pt-4 space-y-3.5">
									<div className="flex items-center gap-2.5 text-xs text-muted-foreground">
										<MailIcon className="size-4 text-muted-foreground/60 shrink-0" />
										<span className="truncate">{manager.email}</span>
									</div>
									<div className="flex items-center gap-2.5 text-xs text-muted-foreground">
										<BriefcaseIcon className="size-4 text-muted-foreground/60 shrink-0" />
										<span className="truncate">{manager.job_title || "Manager"}</span>
									</div>
									<div className="flex items-center gap-2.5 text-xs text-muted-foreground">
										<BuildingIcon className="size-4 text-muted-foreground/60 shrink-0" />
										<span className="truncate">{manager.department || "Administration"}</span>
									</div>

									{currentUser && currentUser._id !== manager._id && (
										<Link
											href={`/member/messages?userId=${manager._id}`}
											className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/95 transition-all duration-200 shadow-sm hover:shadow-md"
										>
											<MessageSquareIcon className="size-3.5" />
											Contact Lead
										</Link>
									)}
								</CardContent>
							</Card>
						) : (
							<Card className="rounded-2xl border-border/50 bg-card p-6 text-center text-xs text-muted-foreground">
								No manager details available.
							</Card>
						)}
					</div>

					{/* Teammates Directory Grid Column */}
					<div className="space-y-4 lg:col-span-2">
						<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Teammates</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{members.map((member) => {
								const isMe = currentUser && currentUser._id === member._id;
								return (
									<Card
										key={member._id}
										className={`rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
											isMe ? "border-primary/30 ring-1 ring-primary/10" : ""
										}`}
									>
										<CardContent className="p-4 flex gap-4">
											<div className={`size-11 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBg(member.full_name)}`}>
												{getInitials(member.full_name)}
											</div>
											<div className="flex-1 min-w-0 flex flex-col justify-between">
												<div className="min-w-0">
													<div className="flex items-center justify-between gap-2">
														<p className="text-xs font-bold text-foreground truncate">{member.full_name}</p>
														{isMe && (
															<Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-2 py-0.5 shrink-0">
																You
															</Badge>
														)}
													</div>
													<p className="text-[10px] font-semibold text-muted-foreground truncate mt-0.5">
														{member.job_title}
													</p>
													<p className="text-[9px] text-muted-foreground/60 truncate mt-1 flex items-center gap-1">
														<BuildingIcon className="size-3" />
														{member.department}
													</p>
												</div>

												{!isMe && (
													<div className="mt-3.5 pt-3 border-t border-border/10 flex justify-end">
														<Link
															href={`/member/messages?userId=${member._id}`}
															className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
														>
															<MessageSquareIcon className="size-3" />
															Message
														</Link>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>

				</div>
			</div>
		</div>
	);
}
