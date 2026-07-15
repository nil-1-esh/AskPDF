export const chunkText = ({ documentId, filename, pages, chunkSize = 500, overlap = 100 }) => {
    const chunks = [];

    for (const { pageNumber, text } of pages) {
        const cleaned = text.replace(/\s+/g, ' ').trim();
        if (!cleaned) continue;

        let start = 0;
        while (start < cleaned.length) {
            const end = Math.min(start + chunkSize, cleaned.length);
            const chunkStr = cleaned.slice(start, end);

            chunks.push({
                documentId,
                filename,
                pageNumber,
                chunkText: chunkStr
            });

            if (end === cleaned.length) break;
            start = end - overlap; // step forward, but re-include the overlap window
        }
    }

    return chunks;
};

// in this function a chunk is of 1 page only different pages will have different chunks , this tradeoff ensures that the page
// of text is known but it is at the cost of interpage context 