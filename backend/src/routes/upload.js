import express from 'express';
import multer from 'multer';
import { uploadPdfs } from '../controllers/uploadController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.array('pdfs', 10), uploadPdfs);

export default router;