"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Bell, Moon, Sun, User, ChevronDown, LogOut, Settings, LayoutDashboard, MessageSquare, Briefcase, FolderKanban, ListChecks, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { logout_api } from "@/api/api";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";

export function SiteHeader({ title }) {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [user, setUser] = useState(null);
	const [mounted, setMounted] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [results, setResults] = useState({ tasks: [], projects: [] });
	const [searchLoading, setSearchLoading] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const searchContainerRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
				setShowDropdown(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		if (searchQuery.trim().length < 2) {
			setResults({ tasks: [], projects: [] });
			setShowDropdown(false);
			return;
		}

		const delayDebounceFn = setTimeout(async () => {
			setSearchLoading(true);
			setShowDropdown(true);
			try {
				const res = await axiosInstance.get(`/search?q=${encodeURIComponent(searchQuery)}`);
				setResults(res.data);
			} catch (err) {
				console.error(err);
			} finally {
				setSearchLoading(false);
			}
		}, 300);

		return () => clearTimeout(delayDebounceFn);
	}, [searchQuery]);

	useEffect(() => {
		setMounted(true);
		const savedUser = localStorage.getItem("user");
		if (savedUser) setUser(JSON.parse(savedUser));

		const fetchNotifications = async () => {
			try {
				const res = await axiosInstance.get("/messages");
				const newMsgs = res.data.messages.slice(-5).map(m => ({
					id: m._id,
					title: "New Message",
					description: `From ${m.sender?.full_name}: ${m.content.slice(0, 35)}...`,
					time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
					type: "message",
					icon: <MessageSquare className="size-3 text-blue-500" />
				}));
				setNotifications(newMsgs.reverse());
			} catch (e) { console.error(e); }
		};

		fetchNotifications();
		const interval = setInterval(fetchNotifications, 30000);
		return () => clearInterval(interval);
	}, []);

	const currentTheme = resolvedTheme || theme;

	const handleLogout = async () => {
		try {
			await logout_api();
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			toast.success("Logged out successfully");
			router.push("/login");
		} catch {
			toast.error("Failed to logout");
		}
	};

	return (
		<header className='flex sticky top-0 z-30 bg-background/80 backdrop-blur-md h-(--header-height) shrink-0 items-center gap-2 border-b transition-all ease-linear'>
			<div className='flex w-full items-center justify-between px-4 lg:px-6'>
				<div className='flex items-center gap-2'>
					<SidebarTrigger className='-ml-1 hover:bg-muted transition-colors' />
					<Separator
						orientation='vertical'
						className='mx-2 h-4 hidden sm:block'
					/>
					<h1 className='text-base font-bold text-foreground hidden sm:block uppercase tracking-wider'>{title}</h1>
				</div>

				<div ref={searchContainerRef} className='flex-1 max-w-md px-4 hidden md:block relative'>
					<div className='relative group'>
						{searchLoading ? (
							<Loader2 className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary animate-spin' />
						) : (
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
						)}
						<input
							type='text'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onFocus={() => {
								if (searchQuery.trim().length >= 2) setShowDropdown(true);
							}}
							placeholder='Search tasks, projects...'
							className='w-full h-10 pl-10 pr-4 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-medium'
						/>
					</div>

					{showDropdown && (
						<div className='absolute top-full left-4 right-4 mt-2 p-2 bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl z-50 overflow-hidden max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200'>
							{searchLoading && results.tasks.length === 0 && results.projects.length === 0 ? (
								<div className='p-8 text-center text-xs font-bold text-muted-foreground uppercase flex items-center justify-center gap-2'>
									<Loader2 className='size-4 animate-spin text-primary' /> Searching...
								</div>
							) : results.tasks.length === 0 && results.projects.length === 0 ? (
								<div className='p-8 text-center text-xs font-bold text-muted-foreground uppercase'>
									No results found
								</div>
							) : (
								<div className='space-y-4 p-1'>
									{results.projects.length > 0 && (
										<div>
											<div className='px-2 py-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/40 mb-1 flex items-center gap-1.5'>
												<FolderKanban className='size-3' /> Projects
											</div>
											<div className='space-y-0.5'>
												{results.projects.map((project) => (
													<button
														key={project._id}
														onClick={() => {
															setShowDropdown(false);
															setSearchQuery("");
															if (user?.role === "admin" || user?.isAdmin) {
																router.push(`/admin/tasks/${project._id}`);
															} else {
																router.push(`/member/tasks?search=${encodeURIComponent(project.name)}`);
															}
														}}
														className='w-full text-left px-2.5 py-2 rounded-xl hover:bg-muted/50 transition-colors flex flex-col hover:text-primary'
													>
														<span className='text-xs font-bold text-foreground group-hover:text-primary'>{project.name}</span>
														{project.teamId?.name && (
															<span className='text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5'>Team: {project.teamId.name}</span>
														)}
													</button>
												))}
											</div>
										</div>
									)}

									{results.tasks.length > 0 && (
										<div>
											<div className='px-2 py-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/40 mb-1 flex items-center gap-1.5'>
												<ListChecks className='size-3' /> Tasks
											</div>
											<div className='space-y-0.5'>
												{results.tasks.map((task) => (
													<button
														key={task._id}
														onClick={() => {
															setShowDropdown(false);
															setSearchQuery("");
															if (user?.role === "admin" || user?.isAdmin) {
																router.push(`/admin/tasks/${task.projectId?._id || task.projectId}?search=${encodeURIComponent(task.title)}`);
															} else {
																router.push(`/member/tasks?search=${encodeURIComponent(task.title)}`);
															}
														}}
														className='w-full text-left px-2.5 py-2 rounded-xl hover:bg-muted/50 transition-colors flex justify-between items-start gap-2 hover:text-primary'
													>
														<div className='min-w-0 flex-1'>
															<span className='text-xs font-bold text-foreground block truncate'>{task.title}</span>
															{task.projectId?.name && (
																<span className='text-[10px] text-muted-foreground uppercase tracking-wider block mt-0.5'>{task.projectId.name}</span>
															)}
														</div>
														<span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border uppercase tracking-wider ${
															task.status === "done" 
																? "bg-green-500/10 text-green-500 border-green-500/20" 
																: task.status === "in-progress" 
																	? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
																	: "bg-blue-500/10 text-blue-500 border-blue-500/20"
														}`}>
															{task.status}
														</span>
													</button>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					)}
				</div>

				<div className='flex items-center gap-3'>
					<div className='flex items-center gap-1 sm:gap-2'>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className='relative p-2 rounded-xl hover:bg-muted transition-all group'>
									<Bell className='size-5 text-muted-foreground group-hover:text-foreground transition-colors' />
									{notifications.length > 0 && (
										<span className='absolute top-2 right-2 w-4 h-4 bg-red-500 text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-background animate-pulse'>
											{notifications.length}
										</span>
									)}
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-border/50 shadow-2xl overflow-hidden">
								<div className="p-4 border-b bg-muted/20">
									<h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Notifications</h3>
								</div>
								<div className="max-h-[300px] overflow-y-auto divide-y divide-border/10">
									{notifications.length === 0 ? (
										<div className="p-8 text-center text-xs font-bold text-muted-foreground/40 uppercase">No new alerts</div>
									) : (
										notifications.map((n) => (
											<div key={n.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer space-y-1">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														{n.icon}
														<span className="text-[10px] font-black uppercase tracking-tight">{n.title}</span>
													</div>
													<span className="text-[8px] font-bold text-muted-foreground/40">{n.time}</span>
												</div>
												<p className="text-[11px] font-medium text-muted-foreground leading-tight">{n.description}</p>
											</div>
										))
									)}
								</div>
								<div className="p-3 bg-muted/20 border-t text-center">
									<button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Mark all as read</button>
								</div>
							</DropdownMenuContent>
						</DropdownMenu>

						<button 
							onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
							className='p-2 rounded-xl hover:bg-muted transition-all'
						>
							{mounted ? (
								currentTheme === "dark" ? <Sun className='size-5 text-amber-500' /> : <Moon className='size-5 text-slate-500' />
							) : (
								<div className="size-5" />
							)}
						</button>
					</div>

					<Separator orientation='vertical' className='h-6 mx-1' />

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<div className='flex items-center gap-3 pl-2 group cursor-pointer'>
								<div className='flex flex-col items-end hidden sm:flex'>
									<span className='text-sm font-bold text-foreground leading-none'>{user?.full_name || user?.name || "User"}</span>
									<span className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>{user?.role || "Member"}</span>
								</div>
								<div className='relative'>
									<Avatar className='size-9 border-2 border-primary/20 p-0.5 group-hover:scale-105 transition-transform'>
										<AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
											{(user?.full_name || user?.name || "U").charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background' />
								</div>
								<ChevronDown className='size-4 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block' />
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-border/50">
							<DropdownMenuLabel className="px-2 py-1.5">
								<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">My Account</p>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => router.push(user?.role === "admin" ? "/admin/accounts" : "/member/profile")}>
								<User className="mr-2 size-4" />
								<span className="font-bold text-xs">Profile Settings</span>
							</DropdownMenuItem>
							<DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => router.push(user?.role === "admin" ? "/admin/dashboard" : "/member/dashboard")}>
								<LayoutDashboard className="mr-2 size-4" />
								<span className="font-bold text-xs">Dashboard</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="rounded-xl cursor-pointer text-red-500 focus:text-red-500 font-bold" onClick={handleLogout}>
								<LogOut className="mr-2 size-4" />
								<span className="text-xs">Logout Session</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
