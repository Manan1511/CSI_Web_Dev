export const API_URL = 'http://localhost:3001';

export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};
