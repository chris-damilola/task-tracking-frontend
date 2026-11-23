const DEFAULT_API_URL =
  import.meta.env.VITE_API_URL ||
  "https://task-tracking-api-production.up.railway.app/api";

export const getApiBaseUrl = () => {
  const saved = localStorage.getItem("task_api_base_url");
  if (saved && saved.includes("ticket-api")) {
    localStorage.removeItem("task_api_base_url");
    return DEFAULT_API_URL.replace(/\/+$/, "");
  }
  return (saved || DEFAULT_API_URL).replace(/\/+$/, "");
};

export const setApiBaseUrl = (url) => {
  if (!url) {
    localStorage.removeItem("task_api_base_url");
  } else {
    localStorage.setItem("task_api_base_url", url.trim().replace(/\/+$/, ""));
  }
};

export const getAuthToken = () => localStorage.getItem("task_auth_token");

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("task_auth_token", token);
  } else {
    localStorage.removeItem("task_auth_token");
  }
};

export async function apiRequest(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  let payload = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    payload = await response.json();
  } else {
    const text = await response.text();
    payload = { success: response.ok, message: text || response.statusText };
  }

  if (!response.ok) {
    const errorMessage =
      payload?.errors?.[0]?.message ||
      payload?.message ||
      `Request failed (${response.status})`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const api = {
  // Health
  checkHealth: () => apiRequest("/health"),

  // Auth
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  register: (data) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMe: () => apiRequest("/auth/me"),

  // Tasks
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.set(key, String(val));
      }
    });
    const qs = query.toString();
    return apiRequest(`/tasks${qs ? `?${qs}` : ""}`);
  },
  getMyAssignedTasks: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.set(key, String(val));
      }
    });
    const qs = query.toString();
    return apiRequest(`/tasks/my/assigned${qs ? `?${qs}` : ""}`);
  },
  getTaskById: (id) => apiRequest(`/tasks/${id}`),
  createTask: (data) =>
    apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTask: (id, data) =>
    apiRequest(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  updateTaskStatus: (id, status) =>
    apiRequest(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  assignTask: (id, assignedToId) =>
    apiRequest(`/tasks/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ assignedToId }),
    }),
  deleteTask: (id) =>
    apiRequest(`/tasks/${id}`, {
      method: "DELETE",
    }),
  getWorkload: (userId) => apiRequest(`/tasks/workload/${userId}`),

  // Comments
  getComments: (taskId, page = 1, limit = 50) =>
    apiRequest(`/tasks/${taskId}/comments?page=${page}&limit=${limit}`),
  addComment: (taskId, content) =>
    apiRequest(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  updateComment: (commentId, content) =>
    apiRequest(`/comments/${commentId}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }),
  deleteComment: (commentId) =>
    apiRequest(`/comments/${commentId}`, {
      method: "DELETE",
    }),

  // Gemini AI Assistance
  aiSummarize: (taskId) =>
    apiRequest(`/ai/tasks/${taskId}/summarize`, { method: "POST" }),
  aiRecommendStatus: (taskId) =>
    apiRequest(`/ai/tasks/${taskId}/recommend-status`, { method: "POST" }),
  aiRecommendPriority: (taskId) =>
    apiRequest(`/ai/tasks/${taskId}/recommend-priority`, { method: "POST" }),
  aiEstimateEffort: (taskId) =>
    apiRequest(`/ai/tasks/${taskId}/estimate-effort`, { method: "POST" }),

  // Users
  getUsers: () => apiRequest("/users"),
  getUserById: (id) => apiRequest(`/users/${id}`),
  updateUser: (id, data) =>
    apiRequest(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  updateUserRole: (id, role) =>
    apiRequest(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  deactivateUser: (id) =>
    apiRequest(`/users/${id}/deactivate`, { method: "PATCH" }),
  reactivateUser: (id) =>
    apiRequest(`/users/${id}/reactivate`, { method: "PATCH" }),
};
