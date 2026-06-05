"use client";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { useEffect, useState } from "react";
import { get_dashboard_api } from "@/api/api";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UsersIcon } from "lucide-react";

export default function Page() {
	const [dashboardData, setDashboardData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboard = async () => {
			try {
				const data = await get_dashboard_api();
				setDashboardData(data);
			} catch (error) {
				console.error("Failed to fetch dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchDashboard();
	}, []);

	const teamMembers = dashboardData?.teamMembers || [];

	return (
		<>
			<SiteHeader title={"Dashboard"} />
			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

						{/* Stat cards */}
						<SectionCards data={dashboardData} loading={loading} />

						{/* Task progress chart */}
						<div className="px-4 lg:px-6">
							<ChartAreaInteractive data={dashboardData} loading={loading} />
						</div>

						{/* Team members table */}
						<div className="px-4 lg:px-6">
							<Card>
								<CardHeader>
									<div className="flex items-center gap-2">
										<UsersIcon className="h-5 w-5 text-muted-foreground" />
										<div>
											<CardTitle>Team Members</CardTitle>
											<CardDescription>
												Most recently added members across all teams
											</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent className="p-0">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="pl-6">Name</TableHead>
												<TableHead>Email</TableHead>
												<TableHead>Job Title</TableHead>
												<TableHead>Department</TableHead>
												<TableHead className="pr-6">Team</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{loading ? (
												Array.from({ length: 5 }).map((_, i) => (
													<TableRow key={i}>
														{Array.from({ length: 5 }).map((__, j) => (
															<TableCell key={j} className={j === 0 ? "pl-6" : j === 4 ? "pr-6" : ""}>
																<div className="h-4 w-full animate-pulse rounded bg-muted" />
															</TableCell>
														))}
													</TableRow>
												))
											) : teamMembers.length === 0 ? (
												<TableRow>
													<TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
														No team members found
													</TableCell>
												</TableRow>
											) : (
												teamMembers.map((member) => (
													<TableRow key={member._id}>
														<TableCell className="pl-6 font-medium">{member.full_name}</TableCell>
														<TableCell className="text-muted-foreground">{member.email}</TableCell>
														<TableCell>{member.job_title}</TableCell>
														<TableCell>{member.department}</TableCell>
														<TableCell className="pr-6">
															{member.teamId ? (
																<Badge variant="secondary">{member.teamId.name}</Badge>
															) : (
																<span className="text-muted-foreground text-sm">No team</span>
															)}
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</div>

					</div>
				</div>
			</div>
		</>
	);
}
