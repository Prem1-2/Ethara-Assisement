// ── CSV Upload ───────────────────────────────────────────────────────────────

import { create_users_api } from "@/api/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2Icon } from "lucide-react";
import { UploadIcon } from "lucide-react";
import { DownloadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { ResultsTable } from "./ResultTable";
import { toast } from "sonner";

const { Button } = require("@/components/ui/button");

const CSV_TEMPLATE = `username,name,email,password,company,job_title,department
johndoe,John Doe,john@company.com,Pass@123,Acme Inc.,Engineer,Engineering
janedoe,Jane Doe,jane@company.com,Pass@123,Acme Inc.,Designer,Design`;

function parseCSV(text) {
	const lines = text.trim().split(/\r?\n/);
	if (lines.length < 2) return [];
	const headers = lines[0].split(",").map((h) => h.trim());
	return lines.slice(1).map((line) => {
		const values = line.split(",").map((v) => v.trim());
		return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
	});
}

export function CsvUpload() {
	const [preview, setPreview] = useState([]);
	const [parseError, setParseError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [results, setResults] = useState(null);
	const [fileName, setFileName] = useState("");
	const fileRef = useRef(null);

	const handleFileChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setFileName(file.name);
		const reader = new FileReader();
		reader.onload = (ev) => {
			try {
				const rows = parseCSV(ev.target.result);
				if (rows.length === 0) {
					setParseError("No data rows found in the CSV.");
					setPreview([]);
				} else {
					setPreview(rows);
					setParseError("");
				}
			} catch {
				setParseError("Failed to parse CSV file.");
				setPreview([]);
			}
		};
		reader.readAsText(file);
	};

	const removeRow = (idx) => setPreview((p) => p.filter((_, i) => i !== idx));

	const handleSubmit = async () => {
		if (!preview.length) return;
		setSubmitting(true);
		setResults(null);
		try {
			const data = await create_users_api(preview);
			setResults(data);
			if (data.created?.length > 0) toast.success(`${data.created.length} user(s) created`);
			if (data.failed?.length > 0) toast.error(`${data.failed.length} failed`);
		} catch (err) {
			toast.error(err.response?.data?.error || "Something went wrong");
		} finally {
			setSubmitting(false);
		}
	};

	const downloadTemplate = () => {
		const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "users_template.csv";
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Button variant="outline" size="sm" onClick={downloadTemplate}>
					<DownloadIcon className="h-4 w-4 mr-1" /> Download Template
				</Button>
				<Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
					<UploadIcon className="h-4 w-4 mr-1" /> Upload CSV File
				</Button>
				<input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
				{fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
			</div>

			{parseError && <p className="text-sm text-destructive">{parseError}</p>}

			{preview.length > 0 && (
				<div className="space-y-2">
					<p className="text-sm text-muted-foreground">{preview.length} row{preview.length !== 1 ? "s" : ""} ready to import</p>
					<div className="rounded-md border max-h-64 overflow-y-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Username</TableHead>
									<TableHead>Department</TableHead>
									<TableHead>Job Title</TableHead>
									<TableHead className="w-10" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{preview.map((row, i) => (
									<TableRow key={i}>
										<TableCell>{row.name}</TableCell>
										<TableCell>{row.email}</TableCell>
										<TableCell>{row.username}</TableCell>
										<TableCell>{row.department}</TableCell>
										<TableCell>{row.job_title}</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-muted-foreground hover:text-destructive"
												onClick={() => removeRow(i)}
											>
												<Trash2Icon className="h-3.5 w-3.5" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			)}

			{preview.length > 0 && (
				<Button onClick={handleSubmit} disabled={submitting}>
					<UserPlusIcon className="h-4 w-4 mr-2" />
					{submitting ? "Importing..." : `Import ${preview.length} User${preview.length !== 1 ? "s" : ""}`}
				</Button>
			)}

			<ResultsTable results={results} />
		</div>
	);
}