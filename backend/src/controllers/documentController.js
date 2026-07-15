import Document from '../models/Document.js';

export const listDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ status: 'ready' }).sort({ uploadedAt: -1 });
        res.json({ documents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};