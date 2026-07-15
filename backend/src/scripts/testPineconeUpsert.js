import fs from 'fs';
import 'dotenv/config';

import { upsertChunks } from '../utils/vectorStore.js';

const run = async () => {
    const chunks = JSON.parse(fs.readFileSync('C:/Users/niles/OneDrive/Documents/AI pdf/backend/testOutputs/embedded-chunks.json'));
    const count = await upsertChunks(chunks);
    console.log(`Upserted ${count} vectors`);
};

run();