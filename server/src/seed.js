const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Case = require('./models/Case');
const Analysis = require('./models/Analysis');
const CriminalRecord = require('./models/CriminalRecord');

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
    await CriminalRecord.deleteMany({});

    // Seed Criminal Records (15 suspects)
    const criminals = [
      {
        name: 'Victor "Viper" Salazar',
        alias: 'The Viper',
        age: 34,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Assault', date: new Date('2024-03-15'), description: 'Aggravated assault with deadly weapon at nightclub', location: { type: 'Point', coordinates: [-73.987, 40.755] }, convicted: true },
          { crimeType: 'Homicide', date: new Date('2025-08-22'), description: 'Second-degree murder in alleyway - stabbing', location: { type: 'Point', coordinates: [-73.990, 40.760] }, convicted: false }
        ],
        modusOperandi: ['nighttime attacks', 'uses knife', 'targets isolated victims', 'alleyway ambush'],
        associatedWeapons: ['knife', 'switchblade'],
        lastKnownLocation: { type: 'Point', coordinates: [-73.988, 40.757] },
        status: 'wanted',
        dangerLevel: 'extreme',
        physicalDescription: { height: '6\'1"', weight: '195 lbs', distinguishingMarks: ['Snake tattoo on neck', 'Scar across left cheek'] }
      },
      {
        name: 'Marcus "Ghost" Thompson',
        alias: 'Ghost',
        age: 28,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Robbery', date: new Date('2024-06-10'), description: 'Armed robbery of convenience store', location: { type: 'Point', coordinates: [-73.975, 40.765] }, convicted: true },
          { crimeType: 'Theft', date: new Date('2025-01-14'), description: 'Grand larceny - jewelry heist', location: { type: 'Point', coordinates: [-73.982, 40.758] }, convicted: false },
          { crimeType: 'Assault', date: new Date('2025-05-30'), description: 'Assault during robbery attempt', location: { type: 'Point', coordinates: [-73.980, 40.762] }, convicted: false }
        ],
        modusOperandi: ['armed holdup', 'wears mask', 'targets small businesses', 'quick getaway'],
        associatedWeapons: ['gun', 'pistol'],
        lastKnownLocation: { type: 'Point', coordinates: [-73.978, 40.760] },
        status: 'wanted',
        dangerLevel: 'high',
        physicalDescription: { height: '5\'10"', weight: '170 lbs', distinguishingMarks: ['Teardrop tattoo under right eye'] }
      },
      {
        name: 'Elena Vasquez',
        alias: 'La Sombra',
        age: 31,
        gender: 'Female',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Arson', date: new Date('2024-11-03'), description: 'Set fire to rival warehouse', location: { type: 'Point', coordinates: [-73.992, 40.750] }, convicted: true },
          { crimeType: 'Burglary', date: new Date('2025-04-18'), description: 'Break-in at corporate office', location: { type: 'Point', coordinates: [-73.985, 40.752] }, convicted: false }
        ],
        modusOperandi: ['uses accelerant', 'nighttime operations', 'sophisticated entry', 'fire as distraction'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [-73.989, 40.751] },
        status: 'under_surveillance',
        dangerLevel: 'high',
        physicalDescription: { height: '5\'6"', weight: '130 lbs', distinguishingMarks: ['Rose tattoo on right forearm'] }
      },
      {
        name: 'Dmitri Volkov',
        alias: 'The Hammer',
        age: 42,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Homicide', date: new Date('2023-07-19'), description: 'Contract killing - blunt force trauma', location: { type: 'Point', coordinates: [-73.970, 40.768] }, convicted: false },
          { crimeType: 'Assault', date: new Date('2024-02-28'), description: 'Brutal beating of witness', location: { type: 'Point', coordinates: [-73.972, 40.770] }, convicted: true },
          { crimeType: 'Homicide', date: new Date('2025-09-15'), description: 'Suspected in body found at industrial zone', location: { type: 'Point', coordinates: [-73.968, 40.766] }, convicted: false }
        ],
        modusOperandi: ['blunt force', 'industrial areas', 'body disposal', 'nighttime operations'],
        associatedWeapons: ['hammer', 'bat'],
        lastKnownLocation: { type: 'Point', coordinates: [-73.971, 40.769] },
        status: 'wanted',
        dangerLevel: 'extreme',
        physicalDescription: { height: '6\'3"', weight: '230 lbs', distinguishingMarks: ['Broken nose', 'Barbed wire tattoo on both arms'] }
      },
      {
        name: 'James "Slick" Porter',
        alias: 'Slick',
        age: 26,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Theft', date: new Date('2024-09-05'), description: 'Pickpocketing ring leader', location: { type: 'Point', coordinates: [-73.985, 40.758] }, convicted: true },
          { crimeType: 'Burglary', date: new Date('2025-03-22'), description: 'Break-in at luxury apartment', location: { type: 'Point', coordinates: [-73.983, 40.756] }, convicted: false }
        ],
        modusOperandi: ['sleight of hand', 'crowded areas', 'targets tourists', 'electronic lockpick'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [-73.984, 40.757] },
        status: 'released',
        dangerLevel: 'low',
        physicalDescription: { height: '5\'8"', weight: '155 lbs', distinguishingMarks: ['None visible'] }
      },
      {
        name: 'Rasheed "Blade" Al-Farsi',
        alias: 'Blade',
        age: 37,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Assault', date: new Date('2024-01-20'), description: 'Knife attack in transit station', location: { type: 'Point', coordinates: [-73.993, 40.743] }, convicted: true },
          { crimeType: 'Assault', date: new Date('2025-06-11'), description: 'Stabbing outside bar', location: { type: 'Point', coordinates: [-73.990, 40.745] }, convicted: false }
        ],
        modusOperandi: ['knife attacks', 'transit areas', 'targets at night', 'bladed weapon'],
        associatedWeapons: ['knife', 'machete'],
        lastKnownLocation: { type: 'Point', coordinates: [-73.991, 40.744] },
        status: 'wanted',
        dangerLevel: 'extreme',
        physicalDescription: { height: '5\'11"', weight: '185 lbs', distinguishingMarks: ['Knife scar on right hand', 'Crescent moon tattoo on chest'] }
      },
      {
        name: 'Angela "Ice" Chen',
        alias: 'Ice',
        age: 29,
        gender: 'Female',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Suspicious Activity', date: new Date('2024-12-01'), description: 'Surveillance and stalking of corporate targets', location: { type: 'Point', coordinates: [-73.978, 40.763] }, convicted: false },
          { crimeType: 'Theft', date: new Date('2025-07-05'), description: 'Corporate espionage and data theft', location: { type: 'Point', coordinates: [-73.976, 40.761] }, convicted: false }
        ],
        modusOperandi: ['surveillance', 'social engineering', 'electronic intrusion', 'disguise'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [-73.977, 40.762] },
        status: 'under_surveillance',
        dangerLevel: 'moderate',
        physicalDescription: { height: '5\'5"', weight: '120 lbs', distinguishingMarks: ['Changes appearance frequently'] }
      },
      {
        name: 'Terrance "Big T" Williams',
        alias: 'Big T',
        age: 39,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Robbery', date: new Date('2023-11-17'), description: 'Bank robbery - armed and masked', location: { type: 'Point', coordinates: [-73.982, 40.753] }, convicted: true },
          { crimeType: 'Homicide', date: new Date('2024-08-09'), description: 'Shooting during botched robbery', location: { type: 'Point', coordinates: [-73.980, 40.755] }, convicted: false },
          { crimeType: 'Robbery', date: new Date('2025-02-14'), description: 'Armed carjacking', location: { type: 'Point', coordinates: [-73.979, 40.754] }, convicted: false }
        ],
        modusOperandi: ['armed robbery', 'uses gun', 'getaway vehicle', 'daytime attacks'],
        associatedWeapons: ['gun', 'rifle'],
        lastKnownLocation: { type: 'Point', coordinates: [-73.981, 40.754] },
        status: 'wanted',
        dangerLevel: 'extreme',
        physicalDescription: { height: '6\'4"', weight: '260 lbs', distinguishingMarks: ['Full sleeve tattoos both arms', 'Gold front tooth'] }
      },
      {
        name: 'Sofia Moretti',
        alias: 'The Widow',
        age: 45,
        gender: 'Female',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Homicide', date: new Date('2022-05-30'), description: 'Suspected poisoning of spouse', location: { type: 'Point', coordinates: [-73.965, 40.770] }, convicted: false },
          { crimeType: 'Suspicious Activity', date: new Date('2024-10-12'), description: 'Insurance fraud linked to suspicious death', location: { type: 'Point', coordinates: [-73.967, 40.772] }, convicted: false }
        ],
        modusOperandi: ['poison', 'targets partners', 'insurance fraud', 'patience'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [-73.966, 40.771] },
        status: 'under_surveillance',
        dangerLevel: 'high',
        physicalDescription: { height: '5\'7"', weight: '140 lbs', distinguishingMarks: ['None visible — blends into high society'] }
      },
      {
        name: 'Jamal "Torch" Davis',
        alias: 'Torch',
        age: 24,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Arson', date: new Date('2024-07-04'), description: 'Set fire to abandoned building', location: { type: 'Point', coordinates: [-73.995, 40.748] }, convicted: true },
          { crimeType: 'Arson', date: new Date('2025-01-20'), description: 'Vehicle arson in parking structure', location: { type: 'Point', coordinates: [-73.993, 40.746] }, convicted: false },
          { crimeType: 'Vandalism', date: new Date('2025-08-01'), description: 'Property destruction by fire', location: { type: 'Point', coordinates: [-73.994, 40.747] }, convicted: false }
        ],
        modusOperandi: ['fire', 'accelerant', 'abandoned structures', 'vehicles', 'nighttime'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [-73.994, 40.747] },
        status: 'released',
        dangerLevel: 'high',
        physicalDescription: { height: '5\'9"', weight: '165 lbs', distinguishingMarks: ['Burn scars on both hands', 'Flame tattoo on forearm'] }
      },
      {
        name: 'Nikolai Petrov',
        alias: 'The Surgeon',
        age: 50,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Homicide', date: new Date('2021-12-15'), description: 'Precision killing — surgical tools used', location: { type: 'Point', coordinates: [-73.960, 40.775] }, convicted: false },
          { crimeType: 'Homicide', date: new Date('2023-09-03'), description: 'Body found with surgical wounds', location: { type: 'Point', coordinates: [-73.962, 40.773] }, convicted: false },
          { crimeType: 'Assault', date: new Date('2025-04-07'), description: 'Kidnapping and assault of witness', location: { type: 'Point', coordinates: [-73.961, 40.774] }, convicted: false }
        ],
        modusOperandi: ['surgical precision', 'clean cuts', 'body disposal', 'medical knowledge', 'kidnapping'],
        associatedWeapons: ['knife', 'scalpel'],
        lastKnownLocation: { type: 'Point', coordinates: [-73.961, 40.774] },
        status: 'wanted',
        dangerLevel: 'extreme',
        physicalDescription: { height: '5\'11"', weight: '175 lbs', distinguishingMarks: ['Graying temples', 'Wears surgical gloves'] }
      },
      {
        name: 'Deshawn "Wheels" Carter',
        alias: 'Wheels',
        age: 22,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Theft', date: new Date('2025-02-10'), description: 'Vehicle theft ring operator', location: { type: 'Point', coordinates: [-73.988, 40.749] }, convicted: false },
          { crimeType: 'Robbery', date: new Date('2025-06-18'), description: 'Smash-and-grab at electronics store', location: { type: 'Point', coordinates: [-73.986, 40.751] }, convicted: false }
        ],
        modusOperandi: ['vehicle theft', 'smash and grab', 'getaway driver', 'uses motorcycle'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [-73.987, 40.750] },
        status: 'wanted',
        dangerLevel: 'moderate',
        physicalDescription: { height: '5\'7"', weight: '150 lbs', distinguishingMarks: ['Racing stripe tattoo on collarbone'] }
      },
      {
        name: 'Isabelle "Venom" Dumont',
        alias: 'Venom',
        age: 33,
        gender: 'Female',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Assault', date: new Date('2024-04-22'), description: 'Poisoned drinks at social event', location: { type: 'Point', coordinates: [-73.975, 40.758] }, convicted: false },
          { crimeType: 'Homicide', date: new Date('2025-03-11'), description: 'Suspected lethal poisoning at restaurant', location: { type: 'Point', coordinates: [-73.977, 40.760] }, convicted: false }
        ],
        modusOperandi: ['poison', 'social settings', 'trusted by victims', 'chemical compounds'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [-73.976, 40.759] },
        status: 'under_surveillance',
        dangerLevel: 'high',
        physicalDescription: { height: '5\'8"', weight: '135 lbs', distinguishingMarks: ['Always wears rings', 'Chemical burn on left wrist'] }
      },
      {
        name: 'Roberto "El Lobo" Gutierrez',
        alias: 'El Lobo',
        age: 41,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Robbery', date: new Date('2023-10-05'), description: 'Armed robbery of armored truck', location: { type: 'Point', coordinates: [-73.998, 40.742] }, convicted: true },
          { crimeType: 'Assault', date: new Date('2024-05-17'), description: 'Assault on security guard during heist', location: { type: 'Point', coordinates: [-73.996, 40.744] }, convicted: true },
          { crimeType: 'Robbery', date: new Date('2025-10-01'), description: 'Attempted bank heist', location: { type: 'Point', coordinates: [-73.997, 40.743] }, convicted: false }
        ],
        modusOperandi: ['armed heists', 'team operations', 'armored vehicles', 'uses gun'],
        associatedWeapons: ['gun', 'pistol', 'rifle'],
        lastKnownLocation: { type: 'Point', coordinates: [-73.997, 40.743] },
        status: 'released',
        dangerLevel: 'extreme',
        physicalDescription: { height: '6\'0"', weight: '210 lbs', distinguishingMarks: ['Wolf tattoo on back', 'Missing left pinky finger'] }
      },
      {
        name: 'Kenji Tanaka',
        alias: 'Silent',
        age: 36,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Burglary', date: new Date('2024-08-14'), description: 'Silent break-in at museum — art theft', location: { type: 'Point', coordinates: [-73.963, 40.779] }, convicted: false },
          { crimeType: 'Suspicious Activity', date: new Date('2025-05-22'), description: 'Surveillance of high-value targets', location: { type: 'Point', coordinates: [-73.965, 40.777] }, convicted: false }
        ],
        modusOperandi: ['silent entry', 'disables alarms', 'art theft', 'high-value targets', 'nighttime'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [-73.964, 40.778] },
        status: 'wanted',
        dangerLevel: 'moderate',
        physicalDescription: { height: '5\'9"', weight: '160 lbs', distinguishingMarks: ['Minimalist — no distinguishing marks'] }
      }
    ];

    await CriminalRecord.insertMany(criminals);
    console.log(`Seeded ${criminals.length} criminal records.`);

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

