import express from 'express';
import { handleChat, handleChatStream } from '../controllers/chatController.js';
import { getHistory } from '../controllers/historyController.js';

const router = express.Router();

router.post('/chat', handleChat);
router.post('/chat/stream', handleChatStream);
router.get('/chat/history/:sessionId', getHistory);

export default router;



