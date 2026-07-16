export const getSessionId = () => {
    let sessionId = localStorage.getItem('pdfchat_session_id');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('pdfchat_session_id', sessionId);
    }
    return sessionId;
};

export const startNewSession = () => {
    const sessionId = crypto.randomUUID();
    localStorage.setItem('pdfchat_session_id', sessionId);
    return sessionId;
};