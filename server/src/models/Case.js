const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['open', 'investigating', 'closed'], default: 'open' },
  priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  imageUrl: String,
  analyses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Analysis' }],
  notes: [{
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);
