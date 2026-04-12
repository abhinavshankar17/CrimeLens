const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', caseController.createCase);
router.get('/', caseController.getCases);
router.get('/:id', caseController.getCaseById);
router.put('/:id', caseController.updateCase);
router.delete('/:id', caseController.deleteCase);
router.post('/:id/evidence', caseController.addEvidence);
router.post('/:id/notes', caseController.addNote);

module.exports = router;
