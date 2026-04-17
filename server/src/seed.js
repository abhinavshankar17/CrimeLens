const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Case = require('./models/Case');
const Analysis = require('./models/Analysis');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crimelens';

const INCIDENT_TYPES = [
  { title: "Homicide - Residential District", priority: "critical", threat: "CRITICAL", score: 98 },
  { title: "Cold Case Re-examination", priority: "high", threat: "MEDIUM", score: 65 },
  { title: "Unidentified Remains Found", priority: "critical", threat: "HIGH", score: 85 },
  { title: "Suspected Poisoning", priority: "high", threat: "HIGH", score: 80 },
  { title: "Body Discovery - Industrial Zone", priority: "critical", threat: "CRITICAL", score: 95 },
  { title: "Violent Altercation Resulting in Fatality", priority: "critical", threat: "CRITICAL", score: 97 },
  { title: "Ballistics Recovery - Crime Scene", priority: "high", threat: "HIGH", score: 75 },
  { title: "Post-Mortem Scene Reconstruction", priority: "medium", threat: "MEDIUM", score: 55 },
  { title: "Foul Play Suspected - Missing Person", priority: "high", threat: "HIGH", score: 88 },
  { title: "Biological Evidence Collection", priority: "medium", threat: "LOW", score: 30 }
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

    // Generate 10 Cases and associated Analyses
    for (let i = 0; i < 10; i++) {
      const type = INCIDENT_TYPES[i % INCIDENT_TYPES.length];

      const newCase = await Case.create({
        title: `${type.title} - Investigation #${1000 + i}`,
        description: `automated forensic analysis relating to a ${type.title} incident in the local quadrant.`,
        status: i % 6 === 0 ? 'investigating' : (i % 8 === 0 ? 'closed' : 'open'),
        priority: type.priority,
        createdBy: admin._id
      });

      // Create 1-3 analyses for each case
      const analysisCount = Math.floor(Math.random() * 3) + 1;
      const analysisIds = [];

      for (let j = 0; j < analysisCount; j++) {
        const threatLevel = type.threat;
        const threatScore = Math.min(100, Math.max(0, type.score + (Math.random() * 15 - 7)));

        // Pick location: 70% chance to be in a hotspot, 30% random
        let location;
        if (Math.random() < 0.7) {
          const zone = zones[Math.floor(Math.random() * zones.length)];
          location = [
            zone.lng + (Math.random() * 0.008 - 0.004), 
            zone.lat + (Math.random() * 0.008 - 0.004)
          ];
        } else {
          location = [
            locCenter[0] + (Math.random() * 0.08 - 0.04),
            locCenter[1] + (Math.random() * 0.08 - 0.04)
          ];
        }

        // Random detections
        const detCount = Math.floor(Math.random() * 4) + 1;
        const detections = [];
        for (let k = 0; k < detCount; k++) {
          const obj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
          detections.push({
            class: obj.class,
            category: obj.category,
            confidence: Number((0.65 + Math.random() * 0.32).toFixed(2)),
            bbox: {
              x: Math.floor(Math.random() * 600),
              y: Math.floor(Math.random() * 450),
              w: 40 + Math.floor(Math.random() * 120),
              h: 40 + Math.floor(Math.random() * 120)
            }
          });
        }

        // Expanded pool of realistic Unsplash IDs for forensic context
        const forensicPhotos = [
          '1563206767-5b18f218e0de', '1585829365291-0570b56191c7', '1540843467610-853489849503',
          '1624634220732-411db18f50f2', '1521401830884-6c03c1c87ebb', '1610411130327-046644fcf813',
          '1572248525058-20cad655e891', '1450101499163-c8848c66ca85', '1581092160562-40aa08e78837',
          '1590859808308-3d2d9c515b1a', '1496247749665-49cf5b1022e9', '1504151932400-72d433433e2b',
          '1517048676732-d65bc937f952'
        ];

        const imageUrl = `https://images.unsplash.com/photo-${forensicPhotos[(i*3 + j) % forensicPhotos.length]}?auto=format&fit=crop&w=800&q=80`;

        // Differentiate descriptions for multiple evidence items in the same case
        const overviewTemplates = [
          `Advanced forensic imaging detected persistent ${type.title} trajectories. Reconstruction suggests a high-velocity event.`,
          `Ancillary evidence from peripheral sensor #${j + 101} confirms ${type.title} spatial anomalies.`,
          `Automated forensic sweep of the secondary perimeter identified unique ${type.title} signature patterns.`
        ];

        const forensicReport = {
          sceneOverview: overviewTemplates[j % overviewTemplates.length],
          detectedElements: detections.map(d => d.class),
          anomalyAnalysis: ["Post-mortem cooling pattern", "Blood spatter trajectory anomaly"],
          threatAssessment: { level: threatLevel, score: Math.round(threatScore) }
        };

        const analysis = await Analysis.create({
          imageUrl: imageUrl,
          originalFilename: `cam_${i}_${j}.jpg`,
          detections: detections,
          forensicReport,
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
      
      // Add sample forensic notes
      newCase.notes = [
        { content: `Forensic pathology report pending. Initial scene analysis suggests foul play with a ${Math.round(Math.random() * 40 + 60)}% certainty.` },
        { content: "Luminol testing confirmed high concentrations of biological matter at the primary point of entry." }
      ];

      await newCase.save();
    }

    console.log('Successfully seeded 10 cases and associated high-resolution forensics.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();

