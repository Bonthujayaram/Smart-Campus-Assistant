export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`; 