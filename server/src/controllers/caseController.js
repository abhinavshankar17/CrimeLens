const Case = require('../models/Case');
const Analysis = require('../models/Analysis');

const createCase = async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const newCase = await Case.create({
      title,
      description,
      priority,
      createdBy: req.user.id
    });
    res.status(201).json({ case: newCase });
  } catch (error) {
    res.status(500).json({ message: 'Error creating case', error: error.message });
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
    const c = await Case.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority },
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
