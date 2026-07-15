import express from 'express';
import { listDocuments } from '../controllers/documentController.js';

const router = express.Router();
router.get('/documents', listDocuments);

export default router;