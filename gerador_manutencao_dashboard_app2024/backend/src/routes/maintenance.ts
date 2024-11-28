import express from 'express';
import { MaintenanceController } from '../controllers/MaintenanceController';

const router = express.Router();
const maintenanceController = new MaintenanceController();

// Rotas para manutenção
router.post('/maintenance', (req, res) => maintenanceController.createMaintenance(req, res));
router.get('/maintenances', (req, res) => maintenanceController.listMaintenances(req, res));
router.get('/maintenance/stats', (req, res) => maintenanceController.getMaintenanceStats(req, res));
router.get('/maintenance/predictive', (req, res) => maintenanceController.predictiveAnalysis(req, res));
router.get('/maintenance/preventive', (req, res) => maintenanceController.getPreventiveSchedule(req, res));
router.post('/maintenance/corrective', (req, res) => maintenanceController.registerCorrectiveMaintenance(req, res));

export default router;
