import { contextualizeQuestion, generateAnswer } from '../utils/generateAnswer.js';
import { retrieveChunks } from '../utils/retrieveChunks.js';
import { buildPrompt } from '../utils/buildPrompt.js';
import { verifyCitations } from '../utils/verifyCitations.js';
import { generateAnswerStream } from '../utils/generateAnswer.js';

export const handleChat = async (req, res) => {
    try {
        const { question, documentIds = [], history = [] } = req.body;

        if (!question || question.trim() === '') {
            return res.status(400).json({ error: 'Question is required' });
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
        if (citationCheck.hasHallucinatedCitations) {
            console.warn('Hallucinated citations detected:', citationCheck.invalid);
        }

        res.json({ answer, sources, citationCheck });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate answer' });
    }
};


export const handleChatStream = async (req, res) => {
    try {
        const { question, documentIds = [], history = [] } = req.body;

        if (!question || question.trim() === '') {
            return res.status(400).json({ error: 'Question is required' });
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
        res.setHeader('Connection', 'keep-alive'); //this is a sse event(server-side event)

        const stream = await generateAnswerStream(prompt, history);
        let fullAnswer = '';

        for await (const chunk of stream) {
            const text = chunk.text || '';
            fullAnswer += text;
            res.write(`data: ${JSON.stringify({ type: 'token', text })}\n\n`);
        }

        const citationCheck = verifyCitations(fullAnswer, sources);
        res.write(`data: ${JSON.stringify({ type: 'done', sources, citationCheck })}\n\n`);
        res.end();
    } catch (err) {
        console.error(err);
        res.write(`data: ${JSON.stringify({ type: 'error', error: 'Stream failed' })}\n\n`);
        res.end();
    }
};

