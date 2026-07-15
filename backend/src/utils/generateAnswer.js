import { GoogleGenAI } from '@google/genai';
import { retryWithBackoff } from './retryWithBackoff.js';


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Rewrites a follow-up question into a standalone question using recent
 * chat history, so retrieval (Pinecone) doesn't search on a fragment
 * like "what about the other one?" with no context.
 */
export const contextualizeQuestion = async (question, history = []) => {
    if (history.length === 0) return question; // no history yet, nothing to rewrite

    const recentTurns = history.slice(-4).map((t) => `${t.role}: ${t.text}`).join('\n');

    const rewritePrompt = `Given this conversation history and a follow-up question, rewrite the follow-up into a standalone question that makes sense without the history. If it's already standalone, return it unchanged. Return ONLY the rewritten question, nothing else.

History:
${recentTurns}

Follow-up question: ${question}

Standalone question:`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: rewritePrompt,
        config: { temperature: 0, maxOutputTokens: 100 }
    });

    return response.text.trim();
};

/**
 * Generates the final grounded answer, given the RAG prompt (question + labeled
 * context chunks) and the raw conversation history for multi-turn awareness.
 */
export const generateAnswer = async (prompt, history = []) => {
    const contents = [
        ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
        { role: 'user', parts: [{ text: prompt }] }
    ];

    return retryWithBackoff(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents,
            config: {
                systemInstruction:
                    'You are a document assistant. Only answer using the context provided in the latest user message. Never use outside knowledge. Always cite sources inline as [DocumentName, p.X].',
                temperature: 0.2,
                maxOutputTokens: 800
            }
        });
        return response.text;
    });
};



export const generateAnswerStream = async (prompt, history = []) => {
    const contents = [
        ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
        { role: 'user', parts: [{ text: prompt }] }
    ];

    return ai.models.generateContentStream({
        model: 'gemini-3.5-flash',
        contents,
        config: {
            systemInstruction:
                'You are a document assistant. Only answer using the context provided in the latest user message. Never use outside knowledge. Always cite sources inline as [DocumentName, p.X].',
            temperature: 0.2,
            maxOutputTokens: 800
        }
    });
};