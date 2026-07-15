import Document from '../models/Document.js';
import { extractPdfText } from '../utils/extractPdfText.js';
import { chunkText } from '../utils/chunkText.js';
import { embedChunksBatch } from '../utils/embedChunks.js';
import { upsertChunks } from '../utils/vectorStore.js';

export const uploadPdfs = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const results = [];

        for (const file of req.files) {
            const { pages, totalPages } = await extractPdfText(file.buffer);

            const doc = await Document.create({
                filename: file.originalname,
                pageCount: totalPages,
                status: 'processing'
            });

            const chunks = chunkText({
                documentId: doc._id.toString(),
                filename: file.originalname,
                pages
            });

            const embeddedChunks = await embedChunksBatch(chunks);
            const vectorCount = await upsertChunks(embeddedChunks);

            doc.status = 'ready';
            await doc.save();

            results.push({ documentId: doc._id, filename: file.originalname, chunkCount: vectorCount });
        }

        res.json({ message: 'Processed successfully', documents: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Upload processing failed' });
    }
};