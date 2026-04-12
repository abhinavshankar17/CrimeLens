const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Case = require('./models/Case');
const Analysis = require('./models/Analysis');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crimelens';

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

    console.log('Created Users');

    // Mocks for maps and dashboards ...
    // Creating some analyses
    const locCenter = [-74.0060, 40.7128]; // NYC coordinates roughly
    
    const a1 = await Analysis.create({
      imageUrl: '/placeholder.jpg',
      originalFilename: 'alley_cam1.jpg',
      detections: [{ class: 'person', confidence: 0.9, category: 'people', bbox: { x:10, y:10, w:100, h:200 } }],
      forensicReport: {
        threatAssessment: { level: 'MEDIUM', score: 55 }
      },
      threatScore: 55,
      threatLevel: 'MEDIUM',
      location: { type: 'Point', coordinates: [locCenter[0] + 0.01, locCenter[1] + 0.01] },
      analyzedBy: analyst._id
    });

    const a2 = await Analysis.create({
      imageUrl: '/placeholder.jpg',
      originalFilename: 'street_fight.jpg',
      detections: [
        { class: 'person', confidence: 0.9, category: 'people', bbox: { x:10, y:10, w:100, h:200 } },
        { class: 'knife', confidence: 0.8, category: 'weapons', bbox: { x:120, y:10, w:20, h:40 } }
      ],
      forensicReport: {
        threatAssessment: { level: 'CRITICAL', score: 95 }
      },
      threatScore: 95,
      threatLevel: 'CRITICAL',
      location: { type: 'Point', coordinates: [locCenter[0] - 0.01, locCenter[1] - 0.01] },
      analyzedBy: analyst._id
    });

    // Create cases
    const c1 = await Case.create({
      title: "Downtown Alley Disturbance",
      description: "Report of suspicious activity in lower Manhattan alleys.",
      status: "open",
      priority: "high",
      analyses: [a1._id, a2._id],
      createdBy: admin._id
    });

    // Link case
    a1.caseId = c1._id;
    a2.caseId = c1._id;
    await a1.save();
    await a2.save();

    console.log('Created Mock Data');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();
