import axios from "axios";

const AUTH_STORAGE_KEY = "site_auth_token";

// Production (Vercel): use relative "/api" so vercel.json rewrites to your backend.
// Avoid mixed content: on HTTPS, never use VITE_API_BASE starting with "http:".
const base =
  typeof window !== "undefined" &&
  window.location?.protocol === "https:" &&
  import.meta.env.VITE_API_BASE?.startsWith?.("http:")
    ? "/api"
    : import.meta.env.VITE_API_BASE
      ? `${import.meta.env.VITE_API_BASE.replace(/\/api\/?$/, "")}/api`
      : "/api";

const api = axios.create({
  baseURL: base,
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10 second timeout
});

let getToken = () =>
  (typeof window !== "undefined" && window.localStorage?.getItem(AUTH_STORAGE_KEY)) || null;
let onUnauthorized = () => {};

api.setAuthCallbacks = (cb) => {
  if (cb.getToken) getToken = cb.getToken;
  if (cb.onUnauthorized) onUnauthorized = cb.onUnauthorized;
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== "undefined") window.localStorage.removeItem(AUTH_STORAGE_KEY);
      onUnauthorized();
    }
    return Promise.reject(err);
  }
);

// Languages
export const languagesApi = {
  getAll: () => api.get("/languages").then((r) => r.data),
  create: (data) => api.post("/languages", data).then((r) => r.data),
  update: (id, data) => api.put(`/languages/${id}`, data).then((r) => r.data),
  delete: (id, cascade = false) =>
    api.delete(`/languages/${id}?cascade=${cascade}`).then((r) => r.data),
};

// Topics
export const topicsApi = {
  getAll: (languageId) =>
    api.get("/topics", { params: { languageId } }).then((r) => r.data),
  create: (data) => api.post("/topics", data).then((r) => r.data),
  update: (id, data) => api.put(`/topics/${id}`, data).then((r) => r.data),
  delete: (id, cascade = false) =>
    api.delete(`/topics/${id}?cascade=${cascade}`).then((r) => r.data),
};

// Subtopics
export const subtopicsApi = {
  getAll: (topicId) =>
    api.get("/subtopics", { params: { topicId } }).then((r) => r.data),
  create: (data) => api.post("/subtopics", data).then((r) => r.data),
  update: (id, data) => api.put(`/subtopics/${id}`, data).then((r) => r.data),
  delete: (id, cascade = false) =>
    api.delete(`/subtopics/${id}?cascade=${cascade}`).then((r) => r.data),
};

// Questions
export const questionsApi = {
  getAll: (params) => api.get("/questions", { params }).then((r) => r.data),
  getById: (id) => api.get(`/questions/${id}`).then((r) => r.data),
  create: (data) => api.post("/questions", data).then((r) => r.data),
  update: (id, data) => api.put(`/questions/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/questions/${id}`).then((r) => r.data),
  bulk: (data) => api.post("/questions/bulk", data).then((r) => r.data),
};

// Todo app: rules and todos (persisted in DB)
export const todoApi = {
  getRules: () => api.get("/todo/rules").then((r) => r.data),
  createRule: (data) => api.post("/todo/rules", data).then((r) => r.data),
  updateRule: (id, data) => api.put(`/todo/rules/${id}`, data).then((r) => r.data),
  reorderRules: (order) => api.put("/todo/rules/reorder", { order }).then((r) => r.data),
  deleteRule: (id) => api.delete(`/todo/rules/${id}`).then((r) => r.data),
  getTodos: () => api.get("/todo/todos").then((r) => r.data),
  createTodo: (data) => api.post("/todo/todos", data).then((r) => r.data),
  updateTodo: (id, data) => api.put(`/todo/todos/${id}`, data).then((r) => r.data),
  deleteTodo: (id) => api.delete(`/todo/todos/${id}`).then((r) => r.data),
};

// Revision items (spaced repetition, persisted in DB)
export const revisionApi = {
  getAll: () => api.get("/todo/revisions").then((r) => r.data),
  create: (data) => api.post("/todo/revisions", data).then((r) => r.data),
  update: (id, data) => api.put(`/todo/revisions/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/todo/revisions/${id}`).then((r) => r.data),
  markRevised: (id, rating) =>
    api.post(`/todo/revisions/${id}/mark-revised`, { rating }).then((r) => r.data),
  snooze: (id, option) =>
    api.post(`/todo/revisions/${id}/snooze`, { option }).then((r) => r.data),
};

export default api;
