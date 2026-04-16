const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Case = require('./models/Case');
const Analysis = require('./models/Analysis');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crimelens';

const INCIDENT_TYPES = [
  { title: "Armed Robbery Attempt", priority: "critical", threat: "CRITICAL", score: 95 },
  { title: "Public Intoxication", priority: "low", threat: "LOW", score: 25 },
  { title: "Unattended Property", priority: "medium", threat: "MEDIUM", score: 45 },
  { title: "Unauthorized Entry", priority: "high", threat: "HIGH", score: 75 },
  { title: "Traffic Disturbance", priority: "low", threat: "MINIMAL", score: 10 },
  { title: "Vandalism Detected", priority: "medium", threat: "MEDIUM", score: 50 },
  { title: "Suspicious Gathering", priority: "medium", threat: "MEDIUM", score: 55 },
  { title: "Weapon Discharge Detected", priority: "critical", threat: "CRITICAL", score: 98 },
  { title: "Illegal Dumping", priority: "low", threat: "LOW", score: 30 },
  { title: "Nighttime Loitering", priority: "medium", threat: "MEDIUM", score: 40 },
  { title: "Narcotics Activity Suspected", priority: "high", threat: "HIGH", score: 80 },
  { title: "Assault in Progress", priority: "critical", threat: "CRITICAL", score: 92 },
  { title: "Shoplifting Alert", priority: "medium", threat: "MEDIUM", score: 48 },
  { title: "Stolen Vehicle Recovery", priority: "high", threat: "HIGH", score: 70 },
  { title: "Structural Anomaly Detected", priority: "medium", threat: "LOW", score: 35 }
];

const OBJECTS = [
  { class: 'person', category: 'people' },
  { class: 'knife', category: 'weapons' },
  { class: 'gun', category: 'weapons' },
  { class: 'backpack', category: 'objects' },
  { class: 'cell phone', category: 'objects' },
  { class: 'car', category: 'vehicles' },
  { class: 'motorcycle', category: 'vehicles' },
  { class: 'bottle', category: 'objects' }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    // Clear DB
    await User.deleteMany({});
    await Case.deleteMany({});
    await Analysis.deleteMany({});

    // Create users
    const admin = await User.create({
      name: "Admin",
      email: "admin@crimelens.ai",
      password: "password123",
      role: "admin"
    });

    const analyst = await User.create({
      name: "Analyst",
      email: "analyst@crimelens.ai",
      password: "password123",
      role: "analyst"
    });

    console.log('Users initialized');

    const locCenter = [-73.985, 40.758]; // Times Square center

    // Pre-define 3 "Hotspot" zones for clustering
    const zones = [
      { lng: locCenter[0] + 0.005, lat: locCenter[1] + 0.005, name: "Times Square Cluster" },
      { lng: locCenter[0] - 0.012, lat: locCenter[1] + 0.008, name: "Hell's Kitchen Zone" },
      { lng: locCenter[0] + 0.008, lat: locCenter[1] - 0.015, name: "Transit Hub Corridor" }
    ];

    // Generate 15 Cases and associated Analyses
    for (let i = 0; i < 15; i++) {
      const type = INCIDENT_TYPES[i % INCIDENT_TYPES.length];

      const newCase = await Case.create({
        title: `${type.title} - Investigation #${1000 + i}`,
        description: `automated forensic analysis relating to a ${type.title} incident in the local quadrant.`,
        status: i % 4 === 0 ? 'investigating' : (i % 5 === 0 ? 'closed' : 'open'),
        priority: type.priority,
        createdBy: admin._id
      });

      // Create 1-2 analyses for each case
      const analysisCount = Math.floor(Math.random() * 2) + 1;
      const analysisIds = [];

      for (let j = 0; j < analysisCount; j++) {
        const threatLevel = type.threat;
        const threatScore = Math.min(100, Math.max(0, type.score + (Math.random() * 10 - 5)));

        // Pick location: 60% chance to be in a hotspot, 40% random
        let location;
        if (Math.random() < 0.6) {
          const zone = zones[Math.floor(Math.random() * zones.length)];
          location = [
            zone.lng + (Math.random() * 0.004 - 0.002), // Very tight cluster
            zone.lat + (Math.random() * 0.004 - 0.002)
          ];
        } else {
          location = [
            locCenter[0] + (Math.random() * 0.04 - 0.02),
            locCenter[1] + (Math.random() * 0.04 - 0.02)
          ];
        }

        // Random detections
        const detCount = Math.floor(Math.random() * 3) + 1;
        const detections = [];
        for (let k = 0; k < detCount; k++) {
          const obj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
          detections.push({
            class: obj.class,
            category: obj.category,
            confidence: Number((0.7 + Math.random() * 0.25).toFixed(2)),
            bbox: {
              x: Math.floor(Math.random() * 500),
              y: Math.floor(Math.random() * 400),
              w: 50 + Math.floor(Math.random() * 100),
              h: 50 + Math.floor(Math.random() * 100)
            }
          });
        }

        const analysis = await Analysis.create({
          imageUrl: '/placeholder.jpg',
          originalFilename: `cam_${i}_${j}.jpg`,
          detections: detections,
          forensicReport: {
            sceneOverview: `Automated detection system flagged a ${type.title} pattern.`,
            detectedElements: detections.map(d => d.class),
            anomalyAnalysis: ["Movement pattern mismatch", "Object contrast anomaly"],
            threatAssessment: { level: threatLevel, score: Math.round(threatScore) }
          },
          threatScore: Math.round(threatScore),
          threatLevel: threatLevel,
          location: {
            type: 'Point',
            coordinates: location
          },
          analyzedBy: analyst._id,
          caseId: newCase._id
        });

        analysisIds.push(analysis._id);
      }

      newCase.analyses = analysisIds;
      await newCase.save();
    }

    console.log('Successfully seeded 15 cases and associated forensic analyses.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();

