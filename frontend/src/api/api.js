import axiosInstance from "@/utils/axiosInstance";

export const login_api = async (formData) => {
	const res = await axiosInstance.post("/auth/login", {
		email: formData.email,
		password: formData.password,
	});
	return res.data;
};

export const logout_api = async () => {
	const res = await axiosInstance.post("/auth/logout");
	return res.data;
};

export const usere_profile = async () => {
	const res = await axiosInstance.get("/auth/user_profile");

	return res.data;
};

export const refresh_token_api = async () => {
	const res = await axiosInstance.post("/auth/refresh");
	return res.data;
};

export const update_profile_api = async (data) => {
	const res = await axiosInstance.patch("/auth/update_profile", data);
	return res.data;
};

export const logout_session_api = async (sessionId) => {
	const res = await axiosInstance.delete("/auth/session", {
		data: { sessionId },
	});
	return res.data;
};

export const logout_all_sessions_api = async () => {
	const res = await axiosInstance.delete("/auth/session", {
		data: { logoutAll: true },
	});
	return res.data;
};

// Teams API
export const get_teams_api = async () => {
	const res = await axiosInstance.get("/teams");
	return res.data;
};

export const create_team_api = async (data) => {
	const res = await axiosInstance.post("/teams", data);
	return res.data;
};

export const update_team_api = async (id, data) => {
	const res = await axiosInstance.patch(`/teams/${id}`, data);
	return res.data;
};

export const delete_team_api = async (id) => {
	const res = await axiosInstance.delete(`/teams/${id}`);
	return res.data;
};

// Projects API
export const get_projects_api = async () => {
	const res = await axiosInstance.get("/projects");
	return res.data;
};

export const create_project_api = async (data) => {
	const res = await axiosInstance.post("/projects", data);
	return res.data;
};

export const update_project_api = async (id, data) => {
	const res = await axiosInstance.patch(`/projects/${id}`, data);
	return res.data;
};

export const delete_project_api = async (id) => {
	const res = await axiosInstance.delete(`/projects/${id}`);
	return res.data;
};

// Tasks API
export const get_tasks_api = async ({ projectId } = {}) => {
	const params = projectId ? `?projectId=${projectId}` : "";
	const res = await axiosInstance.get(`/tasks${params}`);
	return res.data;
};

export const get_project_api = async (id) => {
	const res = await axiosInstance.get(`/projects/${id}`);
	return res.data;
};

export const create_task_api = async (data) => {
	const res = await axiosInstance.post("/tasks", data);
	return res.data;
};

export const update_task_api = async (id, data) => {
	const res = await axiosInstance.patch(`/tasks/${id}`, data);
	return res.data;
};

export const delete_task_api = async (id) => {
	const res = await axiosInstance.delete(`/tasks/${id}`);
	return res.data;
};

// Dashboard API
export const get_dashboard_api = async () => {
	const res = await axiosInstance.get("/dashboard");
	return res.data;
};

// Users API
export const get_users_api = async ({ page = 1, limit = 10, search = "" } = {}) => {
	const params = new URLSearchParams({ page, limit });
	if (search) params.set("search", search);
	const res = await axiosInstance.get(`/users?${params.toString()}`);
	return res.data;
};

export const create_users_api = async (data) => {
	// data can be a single object or an array
	const res = await axiosInstance.post("/users", data);
	return res.data;
};

export const delete_user_api = async (id) => {
	const res = await axiosInstance.delete(`/users/${id}`);
	return res.data;
};

export const reset_user_password_api = async (id, password) => {
	const res = await axiosInstance.patch(`/users/${id}`, { password });
	return res.data;
};

// Admin Progress API
export const get_admin_progress_api = async (params = {}) => {
	const query = new URLSearchParams();
	if (params.projectId) query.set("projectId", params.projectId);
	if (params.memberId) query.set("memberId", params.memberId);
	const res = await axiosInstance.get(`/admin/progress?${query.toString()}`);
	return res.data;
};
export const get_member_dashboard_api = async () => {
	const res = await axiosInstance.get("/member/dashboard");
	return res.data;
};

export const get_member_tasks_api = async (status = "") => {
	const params = status ? `?status=${status}` : "";
	const res = await axiosInstance.get(`/member/tasks${params}`);
	return res.data;
};

export const update_member_task_api = async (id, data) => {
	// data: { status? } or { note? }
	const res = await axiosInstance.patch(`/member/tasks/${id}`, data);
	return res.data;
};
