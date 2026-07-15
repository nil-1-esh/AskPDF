import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    filename: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    pageCount: { type: Number, required: true },
    status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' }
});

export default mongoose.model('Document', schema);