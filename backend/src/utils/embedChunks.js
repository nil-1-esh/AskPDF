import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


export const embedChunk = async (text, taskType = 'RETRIEVAL_DOCUMENT') => {
    const result = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
        config: { taskType, outputDimensionality: 768 }
    });

    return result.embeddings[0].values;
};


export const embedChunksBatch = async (chunks, taskType = 'RETRIEVAL_DOCUMENT', batchSize = 25) => {
    const embedded = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const texts = batch.map((c) => c.chunkText);

        const result = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: texts, // array of strings -> array of embeddings, same order
            config: { taskType, outputDimensionality: 768 }
        });

        result.embeddings.forEach((embedding, idx) => {
            embedded.push({ ...batch[idx], embedding: embedding.values });
        });

        // small gap between batches only, not per chunk
        if (i + batchSize < chunks.length) {
            await new Promise((r) => setTimeout(r, 500));
        }
    }

    return embedded;
};