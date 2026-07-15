import { pineconeIndex } from '../config/pinecone.js';

// Upsert embedded chunks in batches (Pinecone recommends batching, not one-by-one)
export const upsertChunks = async (embeddedChunks) => {
    const vectors = embeddedChunks.map((chunk, i) => ({
        id: `${chunk.documentId}-${chunk.pageNumber}-${i}`,
        values: chunk.embedding,
        metadata: {
            documentId: chunk.documentId,
            filename: chunk.filename,
            pageNumber: chunk.pageNumber,
            chunkText: chunk.chunkText
        }
    }));

    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await pineconeIndex.upsert({ records: batch });
    }

    return vectors.length;
};

// Query Pinecone, optionally scoped to specific documentIds
export const queryChunks = async (queryEmbedding, { topK = 5, documentIds = [] } = {}) => { //search every document
    const queryOptions = {
        vector: queryEmbedding,
        topK,
        includeMetadata: true
    };

    if (documentIds.length > 0) {
        queryOptions.filter = { documentId: { $in: documentIds } };
    }

    const result = await pineconeIndex.query(queryOptions);
    return result.matches; // [{ id, score, metadata: { documentId, filename, pageNumber, chunkText } }, ...]
};