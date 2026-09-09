import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// =========================
// AUTH
// =========================

export const registerUser = async (name, email, password, role = 'Recruiter') => {
  try {
    const response = await api.post('/register', {
      name,
      email,
      password,
      role,
    });

    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const loginUser = async (email, password, role) => {
  try {
    const response = await api.post('/login', {
      email,
      password,
      ...(role ? { role } : {}),
    });

    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/me');
    return response.data;
  } catch (error) {
    console.error('Not authenticated:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/logout');
    return response.data;
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

// =========================
// RESUME MATCHING
// =========================

export const analyzeResumeAndJD = async (file, jobId) => {
  const formData = new FormData();

  formData.append('resume', file);
  formData.append('job_id', jobId);

  try {
    const response = await api.post('/match', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error calculating match score:', error);
    throw error;
  }
};

// =========================
// ANALYTICS
// =========================

export const fetchAnalyticsData = async () => {
  try {
    const response = await api.get('/analytics');
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

// =========================
// JOBS
// =========================

export const fetchJobs = async () => {
  try {
    const response = await api.get('/jobs');
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

// =========================
// HEALTH
// =========================

export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
};

export const analyzeResumeAgainstRoles = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await api.post('/match-all', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createRole = async (role) => {
  const response = await api.post('/roles', role);
  return response.data;
};