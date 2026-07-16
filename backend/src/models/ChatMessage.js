import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'model'], required: true },
    text: { type: String, required: true },
    sources: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ChatMessage', chatMessageSchema);