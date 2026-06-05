// ── JSON Upload ──────────────────────────────────────────────────────────────

import { create_users_api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadIcon } from "lucide-react";
import { UserPlusIcon } from "lucide-react";
import { DownloadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ResultsTable } from "./ResultTable";

const JSON_TEMPLATE = JSON.stringify(
	[
		{
			username: "johndoe",
			name: "John Doe",
			email: "john@company.com",
			password: "Pass@123",
			company: "Acme Inc.",
			job_title: "Engineer",
			department: "Engineering",
		},
	],
	null,
	2,
);

export function JsonUpload() {
	const [jsonText, setJsonText] = useState("");
	const [parsed, setParsed] = useState(null);
	const [parseError, setParseError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [results, setResults] = useState(null);
	const fileRef = useRef(null);

	const handleFileChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			const text = ev.target.result;
			setJsonText(text);
			tryParse(text);
		};
		reader.readAsText(file);
	};

	const tryParse = (text) => {
		try {
			const data = JSON.parse(text);
			const arr = Array.isArray(data) ? data : [data];
			setParsed(arr);
			setParseError("");
		} catch {
			setParsed(null);
			setParseError("Invalid JSON — check the format and try again.");
		}
	};

	const handleTextChange = (e) => {
		setJsonText(e.target.value);
		tryParse(e.target.value);
	};

	const handleSubmit = async () => {
		if (!parsed?.length) return;
		setSubmitting(true);
		setResults(null);
		try {
			const data = await create_users_api(parsed);
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
		const blob = new Blob([JSON_TEMPLATE], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "users_template.json";
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
					<UploadIcon className="h-4 w-4 mr-1" /> Upload JSON File
				</Button>
				<input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileChange} />
			</div>

			<div className="space-y-1.5">
				<Label>JSON Content</Label>
				<Textarea
					className="w-full min-h-[200px] rounded-md border bg-background px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
					placeholder={JSON_TEMPLATE}
					value={jsonText}
					onChange={handleTextChange}
				/>
				{parseError && <p className="text-sm text-destructive">{parseError}</p>}
				{parsed && !parseError && (
					<p className="text-sm text-muted-foreground">{parsed.length} user{parsed.length !== 1 ? "s" : ""} ready to import</p>
				)}
			</div>

			<Button onClick={handleSubmit} disabled={!parsed || submitting}>
				<UserPlusIcon className="h-4 w-4 mr-2" />
				{submitting ? "Importing..." : `Import ${parsed?.length || 0} User${parsed?.length !== 1 ? "s" : ""}`}
			</Button>

			<ResultsTable results={results} />
		</div>
	);
}