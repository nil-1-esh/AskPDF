import ChatMessage from '../models/ChatMessage.js';
import { contextualizeQuestion, generateAnswer, generateAnswerStream } from '../utils/generateAnswer.js';
import { retrieveChunks } from '../utils/retrieveChunks.js';
import { buildPrompt } from '../utils/buildPrompt.js';
import { verifyCitations } from '../utils/verifyCitations.js';

const saveExchange = async (sessionId, question, answer, sources) => {
    await ChatMessage.insertMany([
        { sessionId, role: 'user', text: question, sources: [] },
        { sessionId, role: 'model', text: answer, sources }
    ]);
};

export const handleChat = async (req, res) => {
    try {
        const { question, documentIds = [], history = [], sessionId } = req.body;

        if (!question || question.trim() === '') {
            return res.status(400).json({ error: 'Question is required' });
        }
        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        const standaloneQuestion = await contextualizeQuestion(question, history);
        const chunks = await retrieveChunks(standaloneQuestion, documentIds);
        const prompt = buildPrompt(question, chunks);
        const answer = await generateAnswer(prompt, history);

        const sources = chunks.map((c) => ({
            documentId: c.metadata.documentId,
            filename: c.metadata.filename,
            pageNumber: c.metadata.pageNumber,
            chunkText: c.metadata.chunkText,
            score: c.score
        }));

        const citationCheck = verifyCitations(answer, sources);
        await saveExchange(sessionId, question, answer, sources);

        res.json({ answer, sources, citationCheck });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate answer' });
    }
};

export const handleChatStream = async (req, res) => {
    try {
        const { question, documentIds = [], history = [], sessionId } = req.body;

        if (!question || question.trim() === '') {
            return res.status(400).json({ error: 'Question is required' });
        }
        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        const standaloneQuestion = await contextualizeQuestion(question, history);
        const chunks = await retrieveChunks(standaloneQuestion, documentIds);
        const prompt = buildPrompt(question, chunks);
        const sources = chunks.map((c) => ({
            documentId: c.metadata.documentId,
            filename: c.metadata.filename,
            pageNumber: c.metadata.pageNumber,
            chunkText: c.metadata.chunkText,
            score: c.score
        }));

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive'); //this is a sse (server-side event)
        res.flushHeaders();

        const stream = await generateAnswerStream(prompt, history);
        let fullAnswer = '';

        try {
            for await (const chunk of stream) {
                const text = chunk.text || '';
                fullAnswer += text;
                res.write(`data: ${JSON.stringify({ type: 'token', text })}\n\n`);
            }
        } catch (streamErr) {
            console.error('Stream interrupted mid-answer:', streamErr.message);
            res.write(`data: ${JSON.stringify({ type: 'error', error: 'Answer was interrupted. Please try again.' })}\n\n`);
            res.end();
            return;
        }

        const citationCheck = verifyCitations(fullAnswer, sources);
        await saveExchange(sessionId, question, fullAnswer, sources);

        res.write(`data: ${JSON.stringify({ type: 'done', sources, citationCheck })}\n\n`);
        res.end();
    } catch (err) {
        console.error(err);
        res.write(`data: ${JSON.stringify({ type: 'error', error: 'Stream failed' })}\n\n`);
        res.end();
    }
};