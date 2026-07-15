import express from 'express';
import { handleChat, handleChatStream } from '../controllers/chatController.js';

const router = express.Router();

router.post('/chat', handleChat);
router.post('/chat/stream', handleChatStream);

export default router;



