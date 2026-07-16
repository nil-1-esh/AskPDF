const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const uploadPdfs = async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('pdfs', file));

    const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
};

export const fetchDocuments = async () => {
    const res = await fetch(`${BASE_URL}/documents`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    const data = await res.json();
    return data.documents;
};

export const fetchHistory = async (sessionId) => {
    const res = await fetch(`${BASE_URL}/chat/history/${sessionId}`);
    if (!res.ok) throw new Error('Failed to fetch history');
    const data = await res.json();
    return data.messages;
};