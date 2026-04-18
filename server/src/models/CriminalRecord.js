const mongoose = require('mongoose');

const criminalRecordSchema = new mongoose.Schema({
  name: { type: String, required: true },
  alias: { type: String, default: '' },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  photo: { type: String, default: '' },
  knownCrimes: [{
    crimeType: String,
    date: Date,
    description: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    convicted: { type: Boolean, default: false }
  }],
  modusOperandi: [String],
  associatedWeapons: [String],
  lastKnownLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  status: { 
    type: String, 
    enum: ['wanted', 'incarcerated', 'released', 'under_surveillance'], 
    default: 'wanted' 
  },
  dangerLevel: { 
    type: String, 
    enum: ['extreme', 'high', 'moderate', 'low'], 
    default: 'moderate' 
  },
  physicalDescription: {
    height: String,
    weight: String,
    distinguishingMarks: [String]
  }
}, { timestamps: true });

criminalRecordSchema.index({ lastKnownLocation: '2dsphere' });
criminalRecordSchema.index({ 'knownCrimes.location': '2dsphere' });

module.exports = mongoose.model('CriminalRecord', criminalRecordSchema);
