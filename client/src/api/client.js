import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE
    ? `${import.meta.env.VITE_API_BASE}/api`
    : "/api",
  headers: { "Content-Type": "application/json" },
});

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

export default api;
