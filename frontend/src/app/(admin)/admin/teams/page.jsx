"use client";
import { SiteHeader } from "@/components/site-header";
import { useEffect, useState, useRef, useCallback } from "react";
import { get_teams_api, create_team_api, update_team_api, delete_team_api, get_users_api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, Trash2Icon, EditIcon, SearchIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

const MEMBERS_PER_PAGE = 10;

export default function TeamsPage() {
	const [teams, setTeams] = useState([]);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingTeam, setEditingTeam] = useState(null);
	const [formData, setFormData] = useState({ name: "", members: [] });

	// Members list state
	const [users, setUsers] = useState([]);
	const [memberSearch, setMemberSearch] = useState("");
	const debouncedSearch = useDebounce(memberSearch, 400);
	const [membersLoading, setMembersLoading] = useState(false);
	const [hasMoreMembers, setHasMoreMembers] = useState(false);

	// Use refs so the scroll handler always reads current values without stale closures
	const pageRef = useRef(1);
	const totalPagesRef = useRef(1);
	const loadingRef = useRef(false);
	const searchRef = useRef("");

	// ── Teams ────────────────────────────────────────────────────────────────

	useEffect(() => { fetchTeams(); }, []);

	const fetchTeams = async () => {
		try {
			const data = await get_teams_api();
			setTeams(data.teams);
		} catch {
			toast.error("Failed to fetch teams");
		} finally {
			setLoading(false);
		}
	};

	// ── Members fetch ─────────────────────────────────────────────────────────

	const fetchMembers = useCallback(async (page, search, replace = false) => {
		if (loadingRef.current) return;
		loadingRef.current = true;
		setMembersLoading(true);
		try {
			const data = await get_users_api({ page, limit: MEMBERS_PER_PAGE, search });
			setUsers((prev) => {
				if (replace) return data.users;
				const seen = new Set(prev.map((u) => u._id));
				return [...prev, ...data.users.filter((u) => !seen.has(u._id))];
			});
			pageRef.current = page;
			totalPagesRef.current = data.totalPages;
			setHasMoreMembers(page < data.totalPages);
		} catch {
			console.error("Failed to fetch members");
		} finally {
			loadingRef.current = false;
			setMembersLoading(false);
		}
	}, []);

	// Reset + reload when search changes or dialog opens
	useEffect(() => {
		if (!dialogOpen) return;
		searchRef.current = debouncedSearch;
		setUsers([]);
		pageRef.current = 1;
		totalPagesRef.current = 1;
		loadingRef.current = false;
		setHasMoreMembers(false);
		fetchMembers(1, debouncedSearch, true);
	}, [debouncedSearch, dialogOpen, fetchMembers]);

	// ── Scroll handler — load next page when near bottom ─────────────────────
	const handleListScroll = useCallback((e) => {
		const el = e.currentTarget;
		const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
		if (nearBottom && !loadingRef.current && pageRef.current < totalPagesRef.current) {
			fetchMembers(pageRef.current + 1, searchRef.current);
		}
	}, [fetchMembers]);

	// ── Dialog open/close ─────────────────────────────────────────────────────
	const handleDialogOpenChange = (open) => {
		setDialogOpen(open);
		if (!open) {
			setMemberSearch("");
			setUsers([]);
			pageRef.current = 1;
			totalPagesRef.current = 1;
			loadingRef.current = false;
			setHasMoreMembers(false);
		}
	};

	// ── Form actions ─────────────────────────────────────────────────────────

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (editingTeam) {
				await update_team_api(editingTeam._id, formData);
				toast.success("Team updated successfully");
			} else {
				await create_team_api(formData);
				toast.success("Team created successfully");
			}
			handleDialogOpenChange(false);
			setFormData({ name: "", members: [] });
			setEditingTeam(null);
			fetchTeams();
		} catch (error) {
			toast.error(error.response?.data?.error || "Failed to save team");
		}
	};

	const handleDelete = async (id) => {
		if (!confirm("Are you sure you want to delete this team?")) return;
		try {
			await delete_team_api(id);
			toast.success("Team deleted successfully");
			fetchTeams();
		} catch {
			toast.error("Failed to delete team");
		}
	};

	const handleEdit = (team) => {
		setEditingTeam(team);
		setFormData({
			name: team.name,
			members: team.members.map((m) => m._id),
		});
		setDialogOpen(true);
	};

	const handleMemberToggle = (userId) => {
		setFormData((prev) => ({
			...prev,
			members: prev.members.includes(userId)
				? prev.members.filter((id) => id !== userId)
				: [...prev.members, userId],
		}));
	};

	// ── Render ───────────────────────────────────────────────────────────────

	return (
		<>
			<SiteHeader title="Teams" />
			<div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold">Manage Teams</h2>

					<Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
						<DialogTrigger asChild>
							<Button
								onClick={() => {
									setEditingTeam(null);
									setFormData({ name: "", members: [] });
								}}
							>
								<PlusIcon /> Create Team
							</Button>
						</DialogTrigger>

						<DialogContent>
							<DialogHeader>
								<DialogTitle>{editingTeam ? "Edit Team" : "Create New Team"}</DialogTitle>
								<DialogDescription>
									Fill in the details below to {editingTeam ? "update" : "create"} a team.
								</DialogDescription>
							</DialogHeader>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<Label>Team Name</Label>
									<Input
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										required
									/>
								</div>

								<div>
									<Label>
										Members
										{formData.members.length > 0 && (
											<span className="ml-2 text-xs text-muted-foreground font-normal">
												{formData.members.length} selected
											</span>
										)}
									</Label>
									<div className="space-y-2 mt-1">
										{/* Search */}
										<div className="relative">
											<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<Input
												placeholder="Search members..."
												value={memberSearch}
												onChange={(e) => setMemberSearch(e.target.value)}
												className="pl-9"
											/>
										</div>

										{/* Scrollable list — onScroll triggers next page */}
										<div
											onScroll={handleListScroll}
											className="border rounded-md p-2 max-h-52 overflow-y-auto space-y-1"
										>
											{users.map((user) => (
												<label
													key={user._id}
													className="flex items-center gap-2 cursor-pointer hover:bg-accent p-1 rounded"
												>
													<input
														type="checkbox"
														checked={formData.members.includes(user._id)}
														onChange={() => handleMemberToggle(user._id)}
													/>
													<span className="text-sm">
														{user.full_name}{" "}
														<span className="text-muted-foreground">({user.email})</span>
													</span>
												</label>
											))}

											{/* Loading indicator at bottom */}
											{membersLoading && (
												<div className="flex justify-center py-2">
													<LoaderIcon className="h-4 w-4 animate-spin text-muted-foreground" />
												</div>
											)}

											{!membersLoading && users.length === 0 && (
												<div className="text-sm text-muted-foreground text-center py-2">
													No members found
												</div>
											)}

											{!membersLoading && !hasMoreMembers && users.length > 0 && (
												<div className="text-xs text-muted-foreground text-center py-1">
													All members loaded
												</div>
											)}
										</div>
									</div>
								</div>

								<Button type="submit" className="w-full">
									{editingTeam ? "Update Team" : "Create Team"}
								</Button>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				{/* Teams grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{loading ? (
						<p>Loading...</p>
					) : teams.length === 0 ? (
						<p>No teams found</p>
					) : (
						teams.map((team) => (
							<Card key={team._id}>
								<CardHeader>
									<CardTitle className="flex justify-between items-center">
										{team.name}
										<div className="flex gap-2">
											<Button size="icon" variant="ghost" onClick={() => handleEdit(team)}>
												<EditIcon className="h-4 w-4" />
											</Button>
											<Button size="icon" variant="ghost" onClick={() => handleDelete(team._id)}>
												<Trash2Icon className="h-4 w-4" />
											</Button>
										</div>
									</CardTitle>
									<CardDescription>
										{team.members.length} member{team.members.length !== 1 ? "s" : ""}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{team.members.slice(0, 3).map((member) => (
											<div key={member._id} className="text-sm">
												{member.full_name}
											</div>
										))}
										{team.members.length > 3 && (
											<Badge variant="secondary">+{team.members.length - 3} more</Badge>
										)}
									</div>
								</CardContent>
							</Card>
						))
					)}
				</div>
			</div>
		</>
	);
}
