import 'dotenv/config'
import { embedChunk } from '../utils/embedChunks.js';
import { queryChunks } from '../utils/vectorStore.js';

//this similarity search is similar to the cosine similarity test done before
const run = async () => {
    const question = 'what are ACID properties?';
    const queryEmbedding = await embedChunk(question, 'RETRIEVAL_QUERY'); // note: QUERY, not DOCUMENT

    const results = await queryChunks(queryEmbedding, { topK: 5 });

    results.forEach((r, i) => {
        console.log(`${i + 1}. score=${r.score.toFixed(3)} [${r.metadata.filename}, p.${r.metadata.pageNumber}]`);
        console.log(`   ${r.metadata.chunkText.slice(0, 100)}...`);
    });
};

run();