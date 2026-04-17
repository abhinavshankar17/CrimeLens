const Case = require('../models/Case');
const Analysis = require('../models/Analysis');

const createCase = async (req, res) => {
  console.log('Incoming investigation intake request...', { title: req.body.title, user: req.user?.id });
  try {
    const { title, description, priority, evidenceDescriptions } = req.body;
    
    if (!title) {
       return res.status(400).json({ message: 'Forensic title required for case initialization.' });
    }

    if (!req.user || !req.user.id) {
       return res.status(401).json({ message: 'Investigator session expired. Please log in again.' });
    }

    // Standardize descriptions to array
    const descriptions = Array.isArray(evidenceDescriptions) 
      ? evidenceDescriptions 
      : (evidenceDescriptions ? [evidenceDescriptions] : []);
    
    console.log('Validating case parameters...');
    // Create the case
    const newCase = await Case.create({
      title,
      description: description || '',
      priority: priority || 'medium',
      createdBy: req.user.id
    });
    console.log('New case entity created in database:', newCase._id);

    const analysisIds = [];

    // Process multiple uploaded files if they exist
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        
        try {
          // Create an analysis for each piece of evidence
          const analysis = await Analysis.create({
            imageUrl,
            originalFilename: file.originalname,
            forensicReport: {
              sceneOverview: descriptions[i] || 'Automated scene intake.',
              threatAssessment: { level: (priority || 'medium').toUpperCase(), score: 75 }
            },
            threatScore: 75,
            threatLevel: (priority || 'medium').toUpperCase(),
            caseId: newCase._id,
            analyzedBy: req.user ? req.user.id : null
          });
          
          analysisIds.push(analysis._id);
        } catch (innerError) {
          console.error(`Analysis creation failed for file ${i}:`, innerError);
          // Continue with other files if one fails
        }
      }
    }

    // Update case with analysis links and featured image
    if (analysisIds.length > 0) {
      newCase.analyses = analysisIds;
      const firstAnalysis = await Analysis.findById(analysisIds[0]);
      if (firstAnalysis) {
        newCase.imageUrl = firstAnalysis.imageUrl;
      }
      await newCase.save();
    }

    res.status(201).json({ case: newCase });
  } catch (error) {
    console.error('Create Case Error:', error);
    res.status(500).json({ 
      message: 'Failed to initialize investigation', 
      error: error.message,
      details: 'Check if all required fields are provided and file system permissions are correct.'
    });
  }
};

const getCases = async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) query.title = { $regex: search, $options: 'i' };

    const cases = await Case.find(query).populate('analyses').sort('-createdAt');
    res.json({ cases });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cases', error: error.message });
  }
};

const getCaseById = async (req, res) => {
  try {
    const c = await Case.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate({
        path: 'analyses',
        populate: { path: 'analyzedBy', select: 'name' }
      });
    if (!c) return res.status(404).json({ message: 'Case not found' });
    res.json({ case: c });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching case', error: error.message });
  }
};

const updateCase = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;
    let updateData = { title, description, status, priority };

    if (req.file) {
      updateData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const c = await Case.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json({ case: c });
  } catch (error) {
    res.status(500).json({ message: 'Error updating case', error: error.message });
  }
};

const deleteCase = async (req, res) => {
  try {
    await Case.findByIdAndDelete(req.params.id);
    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting case', error: error.message });
  }
};

const addEvidence = async (req, res) => {
  try {
    const { analysisId } = req.body;
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Case not found' });
    
    if (!c.analyses.includes(analysisId)) {
      c.analyses.push(analysisId);
      await c.save();
      
      const analysis = await Analysis.findById(analysisId);
      if (analysis) {
        analysis.caseId = c._id;
        await analysis.save();
      }
    }
    
    const updatedCase = await Case.findById(req.params.id).populate('analyses');
    res.json({ case: updatedCase });
  } catch (error) {
    res.status(500).json({ message: 'Error adding evidence', error: error.message });
  }
};

const addNote = async (req, res) => {
  try {
    const { content } = req.body;
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Case not found' });
    
    c.notes.push({ content });
    await c.save();
    
    res.json({ case: c });
  } catch (error) {
    res.status(500).json({ message: 'Error adding note', error: error.message });
  }
};

module.exports = {
  createCase, getCases, getCaseById, updateCase, deleteCase, addEvidence, addNote
};
