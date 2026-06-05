import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { XCircleIcon, CheckCircleIcon } from "lucide-react";

export function ResultsTable({ results }) {
	if (!results) return null;
	const { created = [], failed = [] } = results;

	return (
		<div className="space-y-4 mt-4">
			{created.length > 0 && (
				<div>
					<div className="flex items-center gap-2 mb-2">
						<CheckCircleIcon className="h-4 w-4 text-green-500" />
						<span className="text-sm font-medium text-green-600">{created.length} user{created.length !== 1 ? "s" : ""} created</span>
					</div>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Department</TableHead>
									<TableHead>Job Title</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{created.map((u) => (
									<TableRow key={u._id}>
										<TableCell className="font-medium">{u.full_name}</TableCell>
										<TableCell>{u.email}</TableCell>
										<TableCell>{u.department}</TableCell>
										<TableCell>{u.job_title}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			)}
			{failed.length > 0 && (
				<div>
					<div className="flex items-center gap-2 mb-2">
						<XCircleIcon className="h-4 w-4 text-destructive" />
						<span className="text-sm font-medium text-destructive">{failed.length} failed</span>
					</div>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Email / Username</TableHead>
									<TableHead>Reason</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{failed.map((f, i) => (
									<TableRow key={i}>
										<TableCell className="font-medium">{f.entry?.email || f.entry?.username || "—"}</TableCell>
										<TableCell className="text-destructive text-sm">{f.error}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			)}
		</div>
	);
}