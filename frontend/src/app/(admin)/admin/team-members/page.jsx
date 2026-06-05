"use client";
import { SiteHeader } from "@/components/site-header";
import { useEffect, useState, useCallback } from "react";
import { get_users_api, delete_user_api, reset_user_password_api } from "@/api/api";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	SearchIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	Trash2Icon,
	KeyRoundIcon,
	EyeIcon,
	EyeOffIcon,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export default function TeamMembersPage() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 400);

	// Delete dialog
	const [deleteTarget, setDeleteTarget] = useState(null); // user object
	const [deleting, setDeleting] = useState(false);

	// Reset password dialog
	const [resetTarget, setResetTarget] = useState(null); // user object
	const [newPassword, setNewPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [resetting, setResetting] = useState(false);

	// ── Fetch ──────────────────────────────────────────────────────────────

	const fetchUsers = useCallback(async (currentPage, search) => {
		setLoading(true);
		try {
			const data = await get_users_api({ page: currentPage, limit: ITEMS_PER_PAGE, search });
			setUsers(data.users);
			setTotal(data.total);
			setTotalPages(data.totalPages);
		} catch {
			toast.error("Failed to fetch users");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { setPage(1); }, [debouncedSearch]);
	useEffect(() => { fetchUsers(page, debouncedSearch); }, [page, debouncedSearch, fetchUsers]);

	// ── Delete ─────────────────────────────────────────────────────────────

	const confirmDelete = async () => {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			await delete_user_api(deleteTarget._id);
			toast.success(`${deleteTarget.full_name} deleted`);
			setDeleteTarget(null);
			fetchUsers(page, debouncedSearch);
		} catch (err) {
			toast.error(err.response?.data?.error || "Failed to delete user");
		} finally {
			setDeleting(false);
		}
	};

	// ── Reset password ─────────────────────────────────────────────────────

	const confirmReset = async () => {
		if (!resetTarget || !newPassword) return;
		setResetting(true);
		try {
			await reset_user_password_api(resetTarget._id, newPassword);
			toast.success(`Password updated for ${resetTarget.full_name}`);
			setResetTarget(null);
			setNewPassword("");
		} catch (err) {
			toast.error(err.response?.data?.error || "Failed to update password");
		} finally {
			setResetting(false);
		}
	};

	// ── Pagination helpers ─────────────────────────────────────────────────

	const startItem = total === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
	const endItem = Math.min(page * ITEMS_PER_PAGE, total);

	const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
		.filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
		.reduce((acc, p, idx, arr) => {
			if (idx > 0 && p - arr[idx - 1] > 1) acc.push("ellipsis-" + p);
			acc.push(p);
			return acc;
		}, []);

	// ── Render ─────────────────────────────────────────────────────────────

	return (
		<>
			<SiteHeader title="Team Members" />
			<div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">

				{/* Search + count */}
				<div className="flex items-center gap-2">
					<div className="relative flex-1 max-w-sm">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by name, email, or department..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
					{!loading && (
						<div className="text-sm text-muted-foreground">
							{total === 0 ? "No members found" : `Showing ${startItem}–${endItem} of ${total} members`}
						</div>
					)}
				</div>

				{/* Table */}
				<div className="rounded-lg border bg-card">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Job Title</TableHead>
								<TableHead>Department</TableHead>
								<TableHead>Team</TableHead>
								<TableHead className="text-right pr-4">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
									<TableRow key={i}>
										{Array.from({ length: 7 }).map((__, j) => (
											<TableCell key={j}>
												<div className="h-4 w-full animate-pulse rounded bg-muted" />
											</TableCell>
										))}
									</TableRow>
								))
							) : users.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
										No members found
									</TableCell>
								</TableRow>
							) : (
								users.map((user) => (
									<TableRow key={user._id}>
										<TableCell className="font-medium">{user.full_name}</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<Badge variant={user.role === "admin" ? "default" : "secondary"}>
												{user.role}
											</Badge>
										</TableCell>
										<TableCell>{user.job_title}</TableCell>
										<TableCell>{user.department}</TableCell>
										<TableCell>{user.teamId?.name || "No team"}</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-1">
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-muted-foreground hover:text-foreground"
													title="Reset password"
													onClick={() => { setResetTarget(user); setNewPassword(""); setShowPassword(false); }}
												>
													<KeyRoundIcon className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-muted-foreground hover:text-destructive"
													title="Delete user"
													onClick={() => setDeleteTarget(user)}
												>
													<Trash2Icon className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between">
						<Button
							variant="outline" size="sm"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1 || loading}
						>
							<ChevronLeftIcon className="h-4 w-4 mr-1" /> Previous
						</Button>
						<div className="flex items-center gap-1">
							{pageNumbers.map((p) =>
								typeof p === "string" ? (
									<span key={p} className="px-1 text-muted-foreground text-sm">…</span>
								) : (
									<Button
										key={p}
										variant={p === page ? "default" : "outline"}
										size="sm"
										className="w-8 h-8 p-0"
										onClick={() => setPage(p)}
										disabled={loading}
									>
										{p}
									</Button>
								)
							)}
						</div>
						<Button
							variant="outline" size="sm"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page === totalPages || loading}
						>
							Next <ChevronRightIcon className="h-4 w-4 ml-1" />
						</Button>
					</div>
				)}
			</div>

			{/* ── Delete confirmation dialog ── */}
			<Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete user</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete <strong>{deleteTarget?.full_name}</strong>?
							This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
							{deleting ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* ── Reset password dialog ── */}
			<Dialog
				open={!!resetTarget}
				onOpenChange={(o) => { if (!o) { setResetTarget(null); setNewPassword(""); } }}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reset password</DialogTitle>
						<DialogDescription>
							Set a new password for <strong>{resetTarget?.full_name}</strong>.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3 py-2">
						<Label>New Password</Label>
						<div className="relative">
							<Input
								type={showPassword ? "text" : "password"}
								placeholder="Enter new password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="pr-10"
							/>
							<button
								type="button"
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								onClick={() => setShowPassword((v) => !v)}
							>
								{showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
							</button>
						</div>
						<p className="text-xs text-muted-foreground">
							Min 6 characters. The user will need to use this new password to log in.
						</p>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setResetTarget(null)} disabled={resetting}>
							Cancel
						</Button>
						<Button onClick={confirmReset} disabled={resetting || !newPassword}>
							{resetting ? "Updating..." : "Update Password"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
