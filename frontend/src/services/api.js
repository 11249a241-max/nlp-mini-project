import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusmind_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        localStorage.removeItem('campusmind_token');
        localStorage.removeItem('campusmind_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  getDepartments: () => api.get('/auth/departments'),
};

export const dashboardAPI = {
  getStudentData: () => api.get('/dashboard/student'),
  getFacultyData: () => api.get('/dashboard/faculty'),
};

export const projectAPI = {
  submitProject: (data) => api.post('/projects', data),
  analyzeDraft: (data) => api.post('/projects/analyze', data),
  getProjects: () => api.get('/projects'),
  getSimilarityReport: (id) => api.get(`/projects/${id}/similarity-report`),
  reviewProject: (id, reviewData) => api.patch(`/projects/${id}/review`, reviewData),
};

export const complaintAPI = {
  submitComplaint: (data) => api.post('/complaints', data),
  getComplaints: () => api.get('/complaints'),
  getAnalytics: () => api.get('/complaints/analytics'),
  updateStatus: (id, statusData) => api.patch(`/complaints/${id}/status`, statusData),
};

export const noticeAPI = {
  getNotices: (params) => api.get('/notices', { params }),
  uploadNotice: (formData) => api.post('/notices/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  askNotice: (question) => api.post('/notices/ask', { question }),
};

export const assistantAPI = {
  chat: (message) => api.post('/assistant/chat', { message }),
  uploadDocument: (formData) => api.post('/assistant/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getHistory: () => api.get('/assistant/history'),
};

export const discussionAPI = {
  getDiscussions: (params) => api.get('/discussions', { params }),
  createDiscussion: (data) => api.post('/discussions', data),
  postAnswer: (id, data) => api.post(`/discussions/${id}/answers`, data),
  toggleResolve: (id) => api.patch(`/discussions/${id}/resolve`),
  getSummary: (id) => api.get(`/discussions/${id}/summary`),
};

export const researchAPI = {
  getDomains: () => api.get('/research/domains'),
  getRecommendations: (params) => api.get('/research/recommendations', { params }),
  searchTopics: (data) => api.post('/research/search', data),
};

export default api;
