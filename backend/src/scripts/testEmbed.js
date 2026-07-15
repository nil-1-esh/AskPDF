import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const run = async () => {
    const result = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: 'The quick brown fox jumps over the lazy dog',
        config: { taskType: 'RETRIEVAL_DOCUMENT', outputDimensionality: 768 }
    });

    const vector = result.embeddings[0].values;
    console.log('Vector length:', vector.length);
    console.log('First 10 values:', vector.slice(0, 10));
};

run();
