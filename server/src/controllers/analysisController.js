const Analysis = require('../models/Analysis');
const Case = require('../models/Case');
const { detectObjects } = require('../services/yoloService');
const { analyzeScene } = require('../services/geminiService');
const { calculateThreatScore } = require('../services/scoringService');
const fs = require('fs');

const analyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const originalFilename = req.file.originalname;
    const imageUrl = `/uploads/${req.file.filename}`;

    const lat = req.body.latitude ? parseFloat(req.body.latitude) : (40.7128 + (Math.random() - 0.5) * 0.1);
    const lng = req.body.longitude ? parseFloat(req.body.longitude) : (-74.0060 + (Math.random() - 0.5) * 0.1);

    // 1. Get YOLO detections
    const yoloResult = await detectObjects(imagePath, originalFilename);
    const detections = yoloResult.detections || [];

    // 2. Base64 conversion for Gemini
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
    const mimeType = req.file.mimetype;

    // 3. Gemini Forensic Analysis
    const forensicReport = await analyzeScene(imageBase64, mimeType, detections);

    // Provide refined names back onto the detections array to resolve YOLO hallucinations!
    if (forensicReport.refinedClassNames && forensicReport.refinedClassNames.length === detections.length) {
      detections.forEach((det, index) => {
        det.class = forensicReport.refinedClassNames[index] || det.class;
        // Optionally update category based on new class in a real app, 
        // but for now fixing the class string resolves the hallucination.
      });
    }

    // 4. Calculate Threat Score
    const { score, level } = calculateThreatScore(detections, forensicReport);

    // 5. Save to DB
    const analysis = await Analysis.create({
      imageUrl,
      originalFilename,
      detections,
      forensicReport,
      threatScore: score,
      threatLevel: level,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      analyzedBy: req.user.id
    });

    res.status(201).json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: 'Error analyzing image', error: error.message });
  }
};

const getAnalyses = async (req, res) => {
  try {
    const { page = 1, limit = 10, threatLevel } = req.query;
    let query = {};
    if (threatLevel) query.threatLevel = threatLevel.toUpperCase();

    const analyses = await Analysis.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('analyzedBy', 'name');

    const total = await Analysis.countDocuments(query);

    res.json({
      analyses,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analyses', error: error.message });
  }
};

const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id)
      .populate('analyzedBy', 'name')
      .populate('caseId', 'title status');
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analysis', error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const totalAnalyses = await Analysis.countDocuments();
    
    const analyses = await Analysis.find({}, 'threatScore threatLevel detections');
    
    let totalScore = 0;
    const threatDistribution = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, MINIMAL: 0 };
    const objectCounts = {};

    analyses.forEach(a => {
      totalScore += a.threatScore || 0;
      if (a.threatLevel && threatDistribution[a.threatLevel] !== undefined) {
        threatDistribution[a.threatLevel]++;
      }
      
      a.detections.forEach(d => {
        objectCounts[d.class] = (objectCounts[d.class] || 0) + 1;
      });
    });

    const averageThreatScore = totalAnalyses > 0 ? Math.round(totalScore / totalAnalyses) : 0;
    
    const topDetectedObjects = Object.keys(objectCounts)
      .map(k => ({ class: k, count: objectCounts[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentAnalyses = await Analysis.find()
      .sort('-createdAt')
      .limit(10)
      .select('imageUrl threatLevel threatScore createdAt forensicReport.crimeType originalFilename');

    res.json({
      totalAnalyses,
      averageThreatScore,
      threatDistribution,
      topDetectedObjects,
      recentAnalyses
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

const getPatterns = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentAnalyses = await Analysis.find({
      createdAt: { $gte: thirtyDaysAgo },
      threatLevel: { $in: ['CRITICAL', 'HIGH', 'MEDIUM'] }
    });

    const patterns = [];
    const checked = new Set();

    for (const analysis of recentAnalyses) {
      if (checked.has(analysis._id.toString())) continue;

      const nearby = await Analysis.find({
        _id: { $ne: analysis._id },
        location: {
          $nearSphere: {
            $geometry: analysis.location,
            $maxDistance: 2000 // 2km
          }
        },
        createdAt: { $gte: thirtyDaysAgo }
      });

      if (nearby.length >= 2) {
        const allInCluster = [analysis, ...nearby];
        const weaponRelated = allInCluster.filter(a => 
          a.detections.some(d => d.category === 'weapons')
        );

        patterns.push({
          type: 'cluster',
          severity: weaponRelated.length > 0 ? 'high' : 'medium',
          message: `${allInCluster.length} incidents detected within 2km radius${weaponRelated.length > 0 ? ` (${weaponRelated.length} weapon-related)` : ''}`,
          center: analysis.location.coordinates,
          count: allInCluster.length,
          analysisIds: allInCluster.map(a => a._id),
          detectedAt: new Date()
        });

        allInCluster.forEach(a => checked.add(a._id.toString()));
      }
    }

    res.json({ patterns });
  } catch (error) {
    res.status(500).json({ message: 'Error detecting patterns', error: error.message });
  }
};

module.exports = { analyze, getAnalyses, getAnalysisById, getStats, getPatterns };
