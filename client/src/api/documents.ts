import { API_URL, getAuthHeader } from './config';

export const getDocuments = async () => {
    const response = await fetch(`${API_URL}/documents`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
};

export const createDocument = async () => {
    // Empty create for now, title will be default
    const response = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    if (!response.ok) throw new Error('Failed to create document');
    return response.json();
};

export const getDocument = async (id: string) => {
    const response = await fetch(`${API_URL}/documents/${id}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to fetch document');
    return response.json();
};

export const deleteDocument = async (id: string) => {
    const response = await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to delete document');
    return response.json();
};

export const updateDocument = async (id: string, title: string) => {
    const response = await fetch(`${API_URL}/documents/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error('Failed to update document');
    return response.json();
};
