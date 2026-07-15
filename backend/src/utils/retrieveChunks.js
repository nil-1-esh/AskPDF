import { embedChunk } from './embedChunks.js';
import { queryChunks } from './vectorStore.js';

// Strategy A: query once per document, take top-N from each, merge.
// Guarantees every selected document gets representation.
export const retrievePerDocument = async (questionEmbedding, documentIds, perDocK = 3) => {
    const allResults = [];
    for (const docId of documentIds) {
        const matches = await queryChunks(questionEmbedding, { topK: perDocK, documentIds: [docId] });
        allResults.push(...matches);
    }
    return allResults;
};

// Strategy B: one pooled query across all selected documents, larger topK,
// then group/cap per document afterward. Lets genuinely more relevant
// documents naturally get more chunks, at the cost of possibly starving one.
export const retrievePooled = async (questionEmbedding, documentIds, topK = 12, capPerDoc = 4) => {
    const matches = await queryChunks(questionEmbedding, { topK, documentIds });
    const grouped = {};
    const capped = [];

    for (const match of matches) {
        const docId = match.metadata.documentId;
        grouped[docId] = (grouped[docId] || 0) + 1;
        if (grouped[docId] <= capPerDoc) capped.push(match);
    }
    return capped;
};

export const retrieveChunks = async (question, documentIds = [], strategy = 'perDocument') => {
    const questionEmbedding = await embedChunk(question, 'RETRIEVAL_QUERY');

    if (documentIds.length === 0) {
        // no specific selection -> pooled search across everything
        return retrievePooled(questionEmbedding, [], 10, 3);
    }

    return strategy === 'pooled'
        ? retrievePooled(questionEmbedding, documentIds)
        : retrievePerDocument(questionEmbedding, documentIds);
};