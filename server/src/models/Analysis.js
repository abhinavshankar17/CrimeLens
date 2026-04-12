const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  originalFilename: String,
  detections: [{
    class: String,
    confidence: Number,
    category: { type: String, enum: ['weapons', 'people', 'vehicles', 'objects', 'other'], default: 'other' },
    bbox: {
      x: Number, y: Number, w: Number, h: Number
    }
  }],
  forensicReport: {
    sceneOverview: String,
    detectedElements: [String],
    anomalyAnalysis: [String],
    forensicInterpretation: String,
    threatAssessment: {
      level: String,
      score: Number,
      factors: [String]
    },
    recommendedActions: [String],
    crimeType: String,
    confidence: Number
  },
  threatScore: { type: Number, default: 0 },
  threatLevel: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'MINIMAL'], default: 'MINIMAL' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  analyzedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
}, { timestamps: true });

analysisSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Analysis', analysisSchema);
