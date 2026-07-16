import { GoogleGenAI } from '@google/genai';
import { retryWithBackoff } from './retryWithBackoff.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL;

//chat history
export const contextualizeQuestion = async (question, history = []) => {
    if (history.length === 0) return question;

    const recentTurns = history.slice(-4).map((t) => `${t.role}: ${t.text}`).join('\n');

    const rewritePrompt = `Given this conversation history and a follow-up question, rewrite the follow-up into a standalone question that makes sense without the history. If it's already standalone, return it unchanged. Return ONLY the rewritten question, nothing else.

History:
${recentTurns}

Follow-up question: ${question}

Standalone question:`;

    return retryWithBackoff(async () => {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: rewritePrompt,
            config: { maxOutputTokens: 100 }
        });
        return response.text.trim();
    });
};


export const generateAnswer = async (prompt, history = []) => {
    const contents = [
        ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
        { role: 'user', parts: [{ text: prompt }] }
    ];

    return retryWithBackoff(async () => {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents,
            config: {
                systemInstruction:
                    'You are a document assistant. Only answer using the context provided in the latest user message. Never use outside knowledge. Always cite sources inline as [DocumentName, p.X].',
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

    return retryWithBackoff(() =>
        ai.models.generateContentStream({
            model: MODEL,
            contents,
            config: {
                systemInstruction:
                    'You are a document assistant. Only answer using the context provided in the latest user message. Never use outside knowledge. Always cite sources inline as [DocumentName, p.X].',
                maxOutputTokens: 800
            }
        })
    );
};