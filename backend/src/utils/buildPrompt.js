export const buildPrompt = (question, chunks) => {
    if (chunks.length === 0) {
        return `The user asked a question but no relevant context was found. Question: ${question}\n\nRespond that you don't have enough information in the uploaded documents to answer this.`;
    }

    const context = chunks
        .map((c) => `[${c.metadata.filename}, p.${c.metadata.pageNumber}] ${c.metadata.chunkText}`)
        .join('\n\n');

    return `Answer the question using ONLY the context below. Each piece of context is labeled with its source document and page.
When you use information from a source, cite it inline like [DocumentName, p.X].
If the answer isn't in the context, say "I don't know based on these documents."

Context:
${context}

Question: ${question}`;
};