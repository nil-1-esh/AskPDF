import ChatMessage from '../models/ChatMessage.js';

export const getHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });
        res.json({ messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};