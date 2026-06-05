import axios from "axios";

const axiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

axiosInstance.interceptors.response.use(
	(res) => res,
	async (err) => {
		const originalRequest = err.config;

		if (err.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				await axiosInstance.post("/auth/refresh");
				return axiosInstance(originalRequest);
			} catch (refreshError) {
				globalThis.location.href = "/auth/login";
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(err);
	},
);

export default axiosInstance;
