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
        name: 'Vikram "Naag" Saluja',
        alias: 'Naag',
        age: 34,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Assault', date: new Date('2024-03-15'), description: 'Aggravated assault with deadly weapon at nightclub in Connaught Place', location: { type: 'Point', coordinates: [77.2195, 28.6315] }, convicted: true },
          { crimeType: 'Homicide', date: new Date('2025-08-22'), description: 'Second-degree murder in alleyway - stabbing near Chandni Chowk', location: { type: 'Point', coordinates: [77.2307, 28.6506] }, convicted: false }
        ],
        modusOperandi: ['nighttime attacks', 'uses knife', 'targets isolated victims', 'alleyway ambush'],
        associatedWeapons: ['knife', 'switchblade'],
        lastKnownLocation: { type: 'Point', coordinates: [77.2250, 28.6400] },
        status: 'wanted',
        dangerLevel: 'extreme',
        physicalDescription: { height: '5\'11"', weight: '88 kg', distinguishingMarks: ['Snake tattoo on neck', 'Scar across left cheek'] }
      },
      {
        name: 'Mohit "Bhoot" Thakur',
        alias: 'Bhoot',
        age: 28,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Robbery', date: new Date('2024-06-10'), description: 'Armed robbery of jewellery shop in Karol Bagh', location: { type: 'Point', coordinates: [77.1900, 28.6519] }, convicted: true },
          { crimeType: 'Theft', date: new Date('2025-01-14'), description: 'Grand larceny - gold heist from Sadar Bazaar', location: { type: 'Point', coordinates: [77.2060, 28.6560] }, convicted: false },
          { crimeType: 'Assault', date: new Date('2025-05-30'), description: 'Assault during robbery attempt in Paharganj', location: { type: 'Point', coordinates: [77.2130, 28.6440] }, convicted: false }
        ],
        modusOperandi: ['armed holdup', 'wears mask', 'targets small businesses', 'quick getaway'],
        associatedWeapons: ['gun', 'pistol'],
        lastKnownLocation: { type: 'Point', coordinates: [77.2050, 28.6500] },
        status: 'wanted',
        dangerLevel: 'high',
        physicalDescription: { height: '5\'10"', weight: '77 kg', distinguishingMarks: ['Teardrop tattoo under right eye'] }
      },
      {
        name: 'Priya Sharma',
        alias: 'Pari',
        age: 31,
        gender: 'Female',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Arson', date: new Date('2024-11-03'), description: 'Set fire to rival warehouse in Okhla Industrial Area', location: { type: 'Point', coordinates: [77.2710, 28.5310] }, convicted: true },
          { crimeType: 'Burglary', date: new Date('2025-04-18'), description: 'Break-in at corporate office in Nehru Place', location: { type: 'Point', coordinates: [77.2510, 28.5490] }, convicted: false }
        ],
        modusOperandi: ['uses accelerant', 'nighttime operations', 'sophisticated entry', 'fire as distraction'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [77.2600, 28.5400] },
        status: 'under_surveillance',
        dangerLevel: 'high',
        physicalDescription: { height: '5\'5"', weight: '58 kg', distinguishingMarks: ['Rose tattoo on right forearm'] }
      },
      {
        name: 'Baldev "Hathoda" Singh',
        alias: 'Hathoda',
        age: 42,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Homicide', date: new Date('2023-07-19'), description: 'Contract killing - blunt force trauma in Wazirpur Industrial Area', location: { type: 'Point', coordinates: [77.1650, 28.6970] }, convicted: false },
          { crimeType: 'Assault', date: new Date('2024-02-28'), description: 'Brutal beating of witness in Burari', location: { type: 'Point', coordinates: [77.1920, 28.7540] }, convicted: true },
          { crimeType: 'Homicide', date: new Date('2025-09-15'), description: 'Suspected in body found at Bawana Industrial Zone', location: { type: 'Point', coordinates: [77.0510, 28.7930] }, convicted: false }
        ],
        modusOperandi: ['blunt force', 'industrial areas', 'body disposal', 'nighttime operations'],
        associatedWeapons: ['hammer', 'bat'],
        lastKnownLocation: { type: 'Point', coordinates: [77.1700, 28.7000] },
        status: 'wanted',
        dangerLevel: 'extreme',
        physicalDescription: { height: '6\'1"', weight: '105 kg', distinguishingMarks: ['Broken nose', 'Barbed wire tattoo on both arms'] }
      },
      {
        name: 'Jai "Chikna" Patel',
        alias: 'Chikna',
        age: 26,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Theft', date: new Date('2024-09-05'), description: 'Pickpocketing ring leader at India Gate tourist area', location: { type: 'Point', coordinates: [77.2295, 28.6129] }, convicted: true },
          { crimeType: 'Burglary', date: new Date('2025-03-22'), description: 'Break-in at luxury apartment in Greater Kailash', location: { type: 'Point', coordinates: [77.2430, 28.5490] }, convicted: false }
        ],
        modusOperandi: ['sleight of hand', 'crowded areas', 'targets tourists', 'electronic lockpick'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [77.2350, 28.5800] },
        status: 'released',
        dangerLevel: 'low',
        physicalDescription: { height: '5\'7"', weight: '68 kg', distinguishingMarks: ['None visible'] }
      },
      {
        name: 'Ranjeet "Chhura" Yadav',
        alias: 'Chhura',
        age: 37,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Assault', date: new Date('2024-01-20'), description: 'Knife attack at Rajiv Chowk Metro Station', location: { type: 'Point', coordinates: [77.2182, 28.6328] }, convicted: true },
          { crimeType: 'Assault', date: new Date('2025-06-11'), description: 'Stabbing outside dhaba in Sarai Kale Khan', location: { type: 'Point', coordinates: [77.2550, 28.5880] }, convicted: false }
        ],
        modusOperandi: ['knife attacks', 'transit areas', 'targets at night', 'bladed weapon'],
        associatedWeapons: ['knife', 'machete'],
        lastKnownLocation: { type: 'Point', coordinates: [77.2350, 28.6100] },
        status: 'wanted',
        dangerLevel: 'extreme',
        physicalDescription: { height: '5\'10"', weight: '82 kg', distinguishingMarks: ['Knife scar on right hand', 'Crescent moon tattoo on chest'] }
      },
      {
        name: 'Ananya "Baraf" Kapoor',
        alias: 'Baraf',
        age: 29,
        gender: 'Female',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Suspicious Activity', date: new Date('2024-12-01'), description: 'Surveillance and stalking of corporate targets in Cyber City Gurgaon', location: { type: 'Point', coordinates: [77.0880, 28.4949] }, convicted: false },
          { crimeType: 'Theft', date: new Date('2025-07-05'), description: 'Corporate espionage and data theft from Noida IT park', location: { type: 'Point', coordinates: [77.3100, 28.5800] }, convicted: false }
        ],
        modusOperandi: ['surveillance', 'social engineering', 'electronic intrusion', 'disguise'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [77.2000, 28.5400] },
        status: 'under_surveillance',
        dangerLevel: 'moderate',
        physicalDescription: { height: '5\'4"', weight: '55 kg', distinguishingMarks: ['Changes appearance frequently'] }
      },
      {
        name: 'Tarun "Tanker" Gill',
        alias: 'Tanker',
        age: 39,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Robbery', date: new Date('2023-11-17'), description: 'Bank robbery - armed and masked at SBI branch in Dwarka', location: { type: 'Point', coordinates: [77.0420, 28.5920] }, convicted: true },
          { crimeType: 'Homicide', date: new Date('2024-08-09'), description: 'Shooting during botched robbery in Janakpuri', location: { type: 'Point', coordinates: [77.0850, 28.6210] }, convicted: false },
          { crimeType: 'Robbery', date: new Date('2025-02-14'), description: 'Armed carjacking on NH-48 highway', location: { type: 'Point', coordinates: [77.0600, 28.5700] }, convicted: false }
        ],
        modusOperandi: ['armed robbery', 'uses gun', 'getaway vehicle', 'daytime attacks'],
        associatedWeapons: ['gun', 'rifle'],
        lastKnownLocation: { type: 'Point', coordinates: [77.0700, 28.5900] },
        status: 'wanted',
        dangerLevel: 'extreme',
        physicalDescription: { height: '6\'2"', weight: '115 kg', distinguishingMarks: ['Full sleeve tattoos both arms', 'Gold front tooth'] }
      },
      {
        name: 'Savita Devi Rawat',
        alias: 'The Widow',
        age: 45,
        gender: 'Female',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Homicide', date: new Date('2022-05-30'), description: 'Suspected poisoning of spouse in Defence Colony', location: { type: 'Point', coordinates: [77.2330, 28.5730] }, convicted: false },
          { crimeType: 'Suspicious Activity', date: new Date('2024-10-12'), description: 'Insurance fraud linked to suspicious death in Vasant Kunj', location: { type: 'Point', coordinates: [77.1560, 28.5200] }, convicted: false }
        ],
        modusOperandi: ['poison', 'targets partners', 'insurance fraud', 'patience'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [77.1900, 28.5450] },
        status: 'under_surveillance',
        dangerLevel: 'high',
        physicalDescription: { height: '5\'5"', weight: '63 kg', distinguishingMarks: ['None visible — blends into high society'] }
      },
      {
        name: 'Deepak "Aag" Mehra',
        alias: 'Aag',
        age: 24,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Arson', date: new Date('2024-07-04'), description: 'Set fire to abandoned godown in Mundka Industrial Area', location: { type: 'Point', coordinates: [77.0290, 28.6830] }, convicted: true },
          { crimeType: 'Arson', date: new Date('2025-01-20'), description: 'Vehicle arson in multi-level parking, Rajouri Garden', location: { type: 'Point', coordinates: [77.1210, 28.6490] }, convicted: false },
          { crimeType: 'Vandalism', date: new Date('2025-08-01'), description: 'Property destruction by fire in Narela', location: { type: 'Point', coordinates: [77.0930, 28.8520] }, convicted: false }
        ],
        modusOperandi: ['fire', 'accelerant', 'abandoned structures', 'vehicles', 'nighttime'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [77.0800, 28.7200] },
        status: 'released',
        dangerLevel: 'high',
        physicalDescription: { height: '5\'8"', weight: '72 kg', distinguishingMarks: ['Burn scars on both hands', 'Flame tattoo on forearm'] }
      },
      {
        name: 'Dr. Naresh "Jarrrah" Pandey',
        alias: 'The Surgeon',
        age: 50,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Homicide', date: new Date('2021-12-15'), description: 'Precision killing — surgical tools used, body found near AIIMS flyover', location: { type: 'Point', coordinates: [77.2090, 28.5670] }, convicted: false },
          { crimeType: 'Homicide', date: new Date('2023-09-03'), description: 'Body found with surgical wounds in Yamuna floodplain', location: { type: 'Point', coordinates: [77.2780, 28.6130] }, convicted: false },
          { crimeType: 'Assault', date: new Date('2025-04-07'), description: 'Kidnapping and assault of witness in Rohini', location: { type: 'Point', coordinates: [77.1170, 28.7360] }, convicted: false }
        ],
        modusOperandi: ['surgical precision', 'clean cuts', 'body disposal', 'medical knowledge', 'kidnapping'],
        associatedWeapons: ['knife', 'scalpel'],
        lastKnownLocation: { type: 'Point', coordinates: [77.2000, 28.6400] },
        status: 'wanted',
        dangerLevel: 'extreme',
        physicalDescription: { height: '5\'10"', weight: '78 kg', distinguishingMarks: ['Graying temples', 'Wears surgical gloves'] }
      },
      {
        name: 'Arjun "Phatak" Chauhan',
        alias: 'Phatak',
        age: 22,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Theft', date: new Date('2025-02-10'), description: 'Vehicle theft ring operator in South Delhi', location: { type: 'Point', coordinates: [77.2280, 28.5310] }, convicted: false },
          { crimeType: 'Robbery', date: new Date('2025-06-18'), description: 'Smash-and-grab at electronics store in Lajpat Nagar', location: { type: 'Point', coordinates: [77.2380, 28.5690] }, convicted: false }
        ],
        modusOperandi: ['vehicle theft', 'smash and grab', 'getaway driver', 'uses motorcycle'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [77.2330, 28.5500] },
        status: 'wanted',
        dangerLevel: 'moderate',
        physicalDescription: { height: '5\'6"', weight: '65 kg', distinguishingMarks: ['Racing stripe tattoo on collarbone'] }
      },
      {
        name: 'Kavita "Zeher" Malhotra',
        alias: 'Zeher',
        age: 33,
        gender: 'Female',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Assault', date: new Date('2024-04-22'), description: 'Poisoned drinks at social event in Hauz Khas Village', location: { type: 'Point', coordinates: [77.2050, 28.5530] }, convicted: false },
          { crimeType: 'Homicide', date: new Date('2025-03-11'), description: 'Suspected lethal poisoning at upscale restaurant in Khan Market', location: { type: 'Point', coordinates: [77.2270, 28.5990] }, convicted: false }
        ],
        modusOperandi: ['poison', 'social settings', 'trusted by victims', 'chemical compounds'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [77.2150, 28.5760] },
        status: 'under_surveillance',
        dangerLevel: 'high',
        physicalDescription: { height: '5\'6"', weight: '60 kg', distinguishingMarks: ['Always wears rings', 'Chemical burn on left wrist'] }
      },
      {
        name: 'Harpreet "Sher" Sandhu',
        alias: 'Sher',
        age: 41,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Robbery', date: new Date('2023-10-05'), description: 'Armed robbery of cash van on GT Karnal Road', location: { type: 'Point', coordinates: [77.1460, 28.7370] }, convicted: true },
          { crimeType: 'Assault', date: new Date('2024-05-17'), description: 'Assault on security guard during warehouse heist in Naraina', location: { type: 'Point', coordinates: [77.1430, 28.6310] }, convicted: true },
          { crimeType: 'Robbery', date: new Date('2025-10-01'), description: 'Attempted bank heist at PNB branch in Pitampura', location: { type: 'Point', coordinates: [77.1380, 28.6970] }, convicted: false }
        ],
        modusOperandi: ['armed heists', 'team operations', 'armored vehicles', 'uses gun'],
        associatedWeapons: ['gun', 'pistol', 'rifle'],
        lastKnownLocation: { type: 'Point', coordinates: [77.1400, 28.6900] },
        status: 'released',
        dangerLevel: 'extreme',
        physicalDescription: { height: '6\'0"', weight: '95 kg', distinguishingMarks: ['Lion tattoo on back', 'Missing left pinky finger'] }
      },
      {
        name: 'Suraj "Saaya" Nair',
        alias: 'Saaya',
        age: 36,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
        knownCrimes: [
          { crimeType: 'Burglary', date: new Date('2024-08-14'), description: 'Silent break-in at National Museum — artifact theft', location: { type: 'Point', coordinates: [77.2190, 28.6110] }, convicted: false },
          { crimeType: 'Suspicious Activity', date: new Date('2025-05-22'), description: 'Surveillance of high-value targets in Lutyens Delhi', location: { type: 'Point', coordinates: [77.2100, 28.5950] }, convicted: false }
        ],
        modusOperandi: ['silent entry', 'disables alarms', 'art theft', 'high-value targets', 'nighttime'],
        associatedWeapons: [],
        lastKnownLocation: { type: 'Point', coordinates: [77.2140, 28.6030] },
        status: 'wanted',
        dangerLevel: 'moderate',
        physicalDescription: { height: '5\'8"', weight: '70 kg', distinguishingMarks: ['Minimalist — no distinguishing marks'] }
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

