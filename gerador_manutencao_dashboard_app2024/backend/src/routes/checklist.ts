import express from 'express';
import ChecklistController from '../controllers/ChecklistController';

const router = express.Router();

router.get('/checklists', (req, res) => ChecklistController.getChecklists(req, res));
router.post('/checklists', (req, res) => ChecklistController.createChecklist(req, res));
router.put('/checklists/:id', (req, res) => ChecklistController.updateChecklistItem(req, res));
router.delete('/checklists/:id', (req, res) => ChecklistController.deleteChecklistItem(req, res));
router.get('/export/checklists', (req, res) => ChecklistController.exportChecklists(req, res));

export default router;
