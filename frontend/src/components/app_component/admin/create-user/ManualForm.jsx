import { useState } from "react";
import { create_users_api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {UserPlusIcon} from "lucide-react";
import { toast } from "sonner";
import { ResultsTable } from "./ResultTable";

export function ManualForm() {
	const empty = { username: "", name: "", email: "", password: "", company: "", job_title: "", department: "" };
	const [form, setForm] = useState(empty);
	const [submitting, setSubmitting] = useState(false);
	const [results, setResults] = useState(null);

	const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setResults(null);
		try {
			const data = await create_users_api(form);
			setResults(data);
			if (data.created?.length > 0) {
				toast.success("User created successfully");
				setForm(empty);
			} else {
				toast.error(data.failed?.[0]?.error || "Failed to create user");
			}
		} catch (err) {
			toast.error(err.response?.data?.error || "Something went wrong");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<Label>Full Name <span className="text-destructive">*</span></Label>
					<Input placeholder="John Doe" value={form.name} onChange={set("name")} required />
				</div>
				<div className="space-y-1.5">
					<Label>Username <span className="text-destructive">*</span></Label>
					<Input placeholder="johndoe" value={form.username} onChange={set("username")} required />
				</div>
				<div className="space-y-1.5">
					<Label>Email <span className="text-destructive">*</span></Label>
					<Input type="email" placeholder="john@company.com" value={form.email} onChange={set("email")} required />
				</div>
				<div className="space-y-1.5">
					<Label>Password <span className="text-destructive">*</span></Label>
					<Input type="password" placeholder="Min 6 chars, upper, lower, number, special" value={form.password} onChange={set("password")} required />
				</div>
				<div className="space-y-1.5">
					<Label>Company <span className="text-destructive">*</span></Label>
					<Input placeholder="Acme Inc." value={form.company} onChange={set("company")} required />
				</div>
				<div className="space-y-1.5">
					<Label>Job Title <span className="text-destructive">*</span></Label>
					<Input placeholder="Software Engineer" value={form.job_title} onChange={set("job_title")} required />
				</div>
				<div className="space-y-1.5 sm:col-span-2">
					<Label>Department <span className="text-destructive">*</span></Label>
					<Input placeholder="Engineering" value={form.department} onChange={set("department")} required />
				</div>
			</div>
			<Button type="submit" disabled={submitting} className="w-full sm:w-auto">
				<UserPlusIcon className="h-4 w-4 mr-2" />
				{submitting ? "Creating..." : "Create User"}
			</Button>
			<ResultsTable results={results} />
		</form>
	);
}