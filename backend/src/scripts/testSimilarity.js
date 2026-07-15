import fs from 'fs';
import { cosineSimilarity } from '../utils/cosineSimilarity.js';

const chunks = JSON.parse(fs.readFileSync('C:/Users/niles/OneDrive/Documents/AI pdf/backend/testOutputs/embedded-chunks.json'));

// Compare two chunks you expect to be related (e.g. both about the same topic)
const a = chunks[0];
const b = chunks[23];
const similarity = cosineSimilarity(a.embedding, b.embedding);

console.log('Chunk A:', a.chunkText.slice(0, 80));
console.log('Chunk B:', b.chunkText.slice(0, 80));
console.log('Similarity:', similarity);