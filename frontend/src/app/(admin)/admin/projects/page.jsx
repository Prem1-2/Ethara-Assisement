"use client";
import { SiteHeader } from "@/components/site-header";
import { useEffect, useState } from "react";
import { get_projects_api, create_project_api, update_project_api, delete_project_api, get_teams_api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, Trash2Icon, EditIcon } from "lucide-react";
import { toast } from "sonner";

export default function ProjectsPage() {
	const [projects, setProjects] = useState([]);
	const [teams, setTeams] = useState([]);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingProject, setEditingProject] = useState(null);
	const [formData, setFormData] = useState({ name: "", description: "", teamId: "" });

	useEffect(() => {
		fetchProjects();
		fetchTeams();
	}, []);

	const fetchProjects = async () => {
		try {
			const data = await get_projects_api();
			setProjects(data.projects);
		} catch (error) {
			toast.error("Failed to fetch projects");
		} finally {
			setLoading(false);
		}
	};

	const fetchTeams = async () => {
		try {
			const data = await get_teams_api();
			setTeams(data.teams);
		} catch (error) {
			console.error("Failed to fetch teams:", error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (editingProject) {
				await update_project_api(editingProject._id, formData);
				toast.success("Project updated successfully");
			} else {
				await create_project_api(formData);
				toast.success("Project created successfully");
			}
			setDialogOpen(false);
			setFormData({ name: "", description: "", teamId: "" });
			setEditingProject(null);
			fetchProjects();
		} catch (error) {
			toast.error(error.response?.data?.error || "Failed to save project");
		}
	};

	const handleDelete = async (id) => {
		if (!confirm("Are you sure? This will also delete all tasks in this project.")) return;
		try {
			await delete_project_api(id);
			toast.success("Project deleted successfully");
			fetchProjects();
		} catch (error) {
			toast.error("Failed to delete project");
		}
	};

	const handleEdit = (project) => {
		setEditingProject(project);
		setFormData({
			name: project.name,
			description: project.description || "",
			teamId: project.teamId?._id || "",
		});
		setDialogOpen(true);
	};

	return (
		<>
			<SiteHeader title="Projects" />
			<div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold">Manage Projects</h2>
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={() => { setEditingProject(null); setFormData({ name: "", description: "", teamId: "" }); }}>
								<PlusIcon /> Create Project
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
								<DialogDescription>Fill in the details below to {editingProject ? "update" : "create"} a project.</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<Label>Project Name</Label>
									<Input
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										required
									/>
								</div>
								<div>
									<Label>Description</Label>
									<Textarea
										value={formData.description}
										onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									/>
								</div>
								<div>
									<Label>Team</Label>
									<Select value={formData.teamId} onValueChange={(value) => setFormData({ ...formData, teamId: value })}>
										<SelectTrigger>
											<SelectValue placeholder="Select a team" />
										</SelectTrigger>
										<SelectContent>
											{teams.map(team => (
												<SelectItem key={team._id} value={team._id}>
													{team.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<Button type="submit" className="w-full">
									{editingProject ? "Update Project" : "Create Project"}
								</Button>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{loading ? (
						<p>Loading...</p>
					) : projects.length === 0 ? (
						<p>No projects found</p>
					) : (
						projects.map((project) => (
							<Card key={project._id}>
								<CardHeader>
									<CardTitle className="flex justify-between items-center">
										{project.name}
										<div className="flex gap-2">
											<Button size="icon" variant="ghost" onClick={() => handleEdit(project)}>
												<EditIcon className="h-4 w-4" />
											</Button>
											<Button size="icon" variant="ghost" onClick={() => handleDelete(project._id)}>
												<Trash2Icon className="h-4 w-4" />
											</Button>
										</div>
									</CardTitle>
									<CardDescription>
										Team: {project.teamId?.name || "No team"}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">
										{project.description || "No description"}
									</p>
								</CardContent>
							</Card>
						))
					)}
				</div>
			</div>
		</>
	);
}
