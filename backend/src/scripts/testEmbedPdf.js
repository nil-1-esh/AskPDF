import 'dotenv/config';
import fs from 'fs';
import { extractPdfText } from '../utils/extractPdfText.js';
import { chunkText } from '../utils/chunkText.js';
import { embedChunksBatch } from '../utils/embedChunks.js';

const run = async () => {
    const buffer = fs.readFileSync('C:/Users/niles/OneDrive/Documents/AI pdf/backend/testFiles/sample.pdf'); // point at a real test PDF
    const { pages } = await extractPdfText(buffer);

    const chunks = chunkText({
        documentId: 'test-doc-1',
        filename: 'sample.pdf',
        pages,
        chunkSize: 500,
        overlap: 100
    });

    console.log(`Embedding ${chunks.length} chunks...`);
    const embeddedChunks = await embedChunksBatch(chunks);

    fs.writeFileSync('C:/Users/niles/OneDrive/Documents/AI pdf/backend/testOutputs/embedded-chunks.json', JSON.stringify(embeddedChunks, null, 2));
    console.log('Done. Saved to test-output/embedded-chunks.json');
};

run();