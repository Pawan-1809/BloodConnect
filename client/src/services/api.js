import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const hadToken = !!localStorage.getItem('token');

    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/reset-password');
    
    if (status === 401) {
      // Only treat 401 as "session expired" if we previously had a token and the request
      // was not an auth/login/register flow.
      if (hadToken && !isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Avoid hard refresh loops if we're already on /login
        if (window.location.pathname !== '/login') {
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
        }
      }
    } else if (status === 403) {
      toast.error('Access denied');
    } else if (status === 404) {
      // Many screens do polling/search/filter GETs; avoid spamming users on benign 404s.
      const method = (error.config?.method || 'get').toLowerCase();
      if (method !== 'get') {
        toast.error('Resource not found');
      }
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// ============ AUTH APIs ============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  uploadAvatar: (formData) => api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: () => api.post('/auth/resend-verification'),
  getMyDonorProfile: () => api.get('/auth/my-donor-profile')
};

// ============ DONOR APIs ============
export const donorAPI = {
  createProfile: (data) => api.post('/donors/profile', data),
  getProfile: () => api.get('/donors/profile'),
  updateProfile: (data) => api.put('/donors/profile', data),
  searchDonors: (params) => api.get('/donors/search', { params }),
  getNearbyDonors: (params) => api.get('/donors/nearby', { params }),
  getCompatibleDonors: (bloodGroup, params) => api.get(`/donors/compatible/${bloodGroup}`, { params }),
  getDonorById: (id) => api.get(`/donors/${id}`),
  getDonorStats: (id) => api.get(`/donors/${id}/stats`),
  getDonationHistory: (id) => api.get(`/donors/${id}/history`),
  toggleAvailability: () => api.patch('/donors/toggle-availability'),
  updateHealthDeclaration: (data) => api.put('/donors/health-declaration', data),
  getLeaderboard: (params) => api.get('/donors/leaderboard', { params }),
  checkEligibility: () => api.get('/donors/check-eligibility'),
  respondToRequest: (requestId, data) => api.post(`/donors/respond/${requestId}`, data)
};

// ============ REQUEST APIs ============
export const requestAPI = {
  create: (data) => api.post('/requests', data),
  getAll: (params) => api.get('/requests', { params }),
  getMyRequests: (params) => api.get('/requests/my-requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  update: (id, data) => api.put(`/requests/${id}`, data),
  delete: (id) => api.delete(`/requests/${id}`),
  updateStatus: (id, status, notes) => api.patch(`/requests/${id}/status`, { status, notes }),
  respondAsHospital: (id, data) => api.post(`/requests/${id}/hospital-response`, data),
  getDonorResponses: (id) => api.get(`/requests/${id}/donor-responses`),
  acceptDonor: (requestId, donorId) => api.post(`/requests/${requestId}/accept-donor/${donorId}`),
  cancelDonor: (requestId, donorId) => api.post(`/requests/${requestId}/cancel-donor/${donorId}`),
  getStats: () => api.get('/requests/stats'),
  getUrgent: () => api.get('/requests/urgent'),
  broadcastEmergency: (id) => api.post(`/requests/${id}/emergency-broadcast`),
  getMatched: (params) => api.get('/requests/matched', { params }),
  getNearby: (params) => api.get('/requests/nearby', { params })
};

// ============ HOSPITAL APIs ============
export const hospitalAPI = {
  register: (data) => api.post('/hospitals/register', data),
  getProfile: () => api.get('/hospitals/my-hospital'),
  updateProfile: (data) => api.put('/hospitals/my-hospital', data),
  uploadImages: (formData) => api.post('/hospitals/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => api.get('/hospitals', { params }),
  getById: (id) => api.get(`/hospitals/${id}`),
  getNearby: (params) => api.get('/hospitals/nearby', { params }),
  getStock: () => api.get('/hospitals/stock'),
  updateStock: (data) => api.post('/hospitals/stock', data),
  addBloodUnit: (data) => api.post('/hospitals/stock/unit', data),
  updateBloodUnit: (unitId, data) => api.put(`/hospitals/stock/unit/${unitId}`, data),
  deleteBloodUnit: (unitId) => api.delete(`/hospitals/stock/unit/${unitId}`),
  getStockHistory: (params) => api.get('/hospitals/stock/history', { params }),
  getDashboardStats: () => api.get('/hospitals/dashboard'),
  getRequests: (params) => api.get('/hospitals/requests', { params }),
  getDonations: (params) => api.get('/hospitals/donations', { params }),
  createDonation: (data) => api.post('/hospitals/donations', data),
  updateDonation: (id, data) => api.put(`/hospitals/donations/${id}`, data),
  addReview: (hospitalId, data) => api.post(`/hospitals/${hospitalId}/reviews`, data),
  getReviews: (hospitalId, params) => api.get(`/hospitals/${hospitalId}/reviews`, { params })
};

// ============ ADMIN APIs ============
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  banUser: (id, data) => api.post(`/admin/users/${id}/ban`, data),
  getHospitals: (params) => api.get('/admin/hospitals', { params }),
  verifyHospital: (id) => api.post(`/admin/hospitals/${id}/verify`),
  rejectHospital: (id, reason) => api.post(`/admin/hospitals/${id}/reject`, { reason }),
  getAllRequests: (params) => api.get('/admin/requests', { params }),
  getDonations: (params) => api.get('/admin/donations', { params }),
  getSystemHealth: () => api.get('/admin/system-health'),
  getLogs: (params) => api.get('/admin/logs', { params }),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  getAnnouncements: (params) => api.get('/admin/announcements', { params }),
  updateAnnouncement: (id, data) => api.put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
  getBloodTypeDistribution: () => api.get('/admin/analytics/blood-distribution'),
  getDonationTrends: (params) => api.get('/admin/analytics/donation-trends', { params }),
  getRegionalStats: () => api.get('/admin/analytics/regional-stats'),
  exportData: (type, params) => api.get(`/admin/export/${type}`, { params, responseType: 'blob' })
};

// ============ NOTIFICATION APIs ============
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications/all'),
  updatePreferences: (data) => api.put('/notifications/preferences', data),
  getPreferences: () => api.get('/notifications/preferences')
};

// ============ SCHEDULE APIs ============
export const scheduleAPI = {
  create: (data) => api.post('/schedules', data),
  getAll: (params) => api.get('/schedules', { params }),
  getById: (id) => api.get(`/schedules/${id}`),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
  getUpcoming: (params) => api.get('/schedules/upcoming', { params }),
  getNearby: (params) => api.get('/schedules/nearby', { params }),
  getMySchedules: (params) => api.get('/schedules/my-schedules', { params }),
  bookSlot: (id, data) => api.post(`/schedules/${id}/book`, data),
  cancelBooking: (id) => api.post(`/schedules/${id}/cancel-booking`),
  getAvailableSlots: (id, date) => api.get(`/schedules/${id}/slots`, { params: { date } }),
  createBloodDrive: (data) => api.post('/schedules/blood-drive', data),
  getBloodDrives: (params) => api.get('/schedules/blood-drives', { params }),
  registerForDrive: (id) => api.post(`/schedules/blood-drives/${id}/register`),
  unregisterFromDrive: (id) => api.post(`/schedules/blood-drives/${id}/unregister`),
  getMyAppointments: (params) => api.get('/schedules/my-appointments', { params })
};

// ============ DONATION APIs ============
export const donationAPI = {
  getAll: (params) => api.get('/donations', { params }),
  getById: (id) => api.get(`/donations/${id}`),
  getMyDonations: (params) => api.get('/donations/my-donations', { params }),
  getCertificate: (id) => api.get(`/donations/${id}/certificate`, { responseType: 'blob' })
};

// ============ STATS APIs ============
export const statsAPI = {
  getGlobal: () => api.get('/stats/global'),
  getByRegion: (region) => api.get(`/stats/region/${region}`),
  getBloodAvailability: (params) => api.get('/stats/blood-availability', { params }),
  getLiveUpdates: () => api.get('/stats/live')
};

export default api;
