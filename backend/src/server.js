import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import main from './config/db.js';
import uploadRoutes from './routes/upload.js';
import documentRoutes from './routes/documents.js';
import chatRoutes from './routes/chat.js';


import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);


const app = express();
app.use(express.json());
app.use(cors());

app.use('/api', uploadRoutes);
app.use('/api', documentRoutes);
app.use('/api', chatRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));


const PORT = process.env.PORT || 3000;

const initializeConnection = async () => {
    try {
        await main();
        console.log("DB connected");

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    }
    catch (error) {
        console.log(error);
    }
}

initializeConnection();

