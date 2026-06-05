"use client";
import { SiteHeader } from "@/components/site-header";
import { useEffect, useState } from "react";
import { get_users_api } from "@/api/api";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function TeamMembersPage() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const data = await get_users_api();
				setUsers(data.users);
			} catch (error) {
				console.error("Failed to fetch users:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchUsers();
	}, []);

	return (
		<>
			<SiteHeader title={"Team Members"} />
			<div className='flex flex-1 flex-col gap-4 p-4 lg:p-6'>
				<div className='rounded-lg border bg-card'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Job Title</TableHead>
								<TableHead>Department</TableHead>
								<TableHead>Team</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ?
								<TableRow>
									<TableCell colSpan={6} className='text-center'>
										Loading...
									</TableCell>
								</TableRow>
							: users.length === 0 ?
								<TableRow>
									<TableCell colSpan={6} className='text-center'>
										No users found
									</TableCell>
								</TableRow>
							:	users.map((user) => (
									<TableRow key={user._id}>
										<TableCell className='font-medium'>
											{user.full_name}
										</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<Badge
												variant={
													user.role === "admin" ? "default" : "secondary"
												}
											>
												{user.role}
											</Badge>
										</TableCell>
										<TableCell>{user.job_title}</TableCell>
										<TableCell>{user.department}</TableCell>
										<TableCell>{user.teamId?.name || "No team"}</TableCell>
									</TableRow>
								))
							}
						</TableBody>
					</Table>
				</div>
			</div>
		</>
	);
}
