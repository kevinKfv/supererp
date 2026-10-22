// Centralized API configuration for OptimusAI frontend
// In Railway or any production host, VITE_API_URL should point to the public Gateway URL.
// Example: https://gateway-service-production.up.railway.app
// When running locally with Docker Compose, it defaults to http://localhost:8000.

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') ||
  'http://localhost:8000';

export const API_ENDPOINTS = {
  identity: {
    login: `${API_BASE_URL}/api/v1/identity/auth/login`,
    register: `${API_BASE_URL}/api/v1/identity/auth/register`,
    me: `${API_BASE_URL}/api/v1/identity/users/me`,
  },
  optimization: {
    assignment: `${API_BASE_URL}/api/v1/optimize/assignment`,
    status: (taskId: string) => `${API_BASE_URL}/api/v1/optimize/status/${taskId}`,
  },
  prediction: {
    predict: `${API_BASE_URL}/api/v1/predict/predict`,
    train: `${API_BASE_URL}/api/v1/predict/train`,
  },
  simulation: {
    montecarlo: `${API_BASE_URL}/api/v1/simulate/montecarlo`,
  },
  rules: {
    evaluate: `${API_BASE_URL}/api/v1/rules/evaluate/`,
  },
  chat: {
    intent: `${API_BASE_URL}/api/v1/chat/intent`,
  },
};
