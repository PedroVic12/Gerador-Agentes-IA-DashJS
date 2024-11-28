"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MaintenanceController_1 = require("../controllers/MaintenanceController");
const router = express_1.default.Router();
const maintenanceController = new MaintenanceController_1.MaintenanceController();
// Rotas para manutenção
router.post('/maintenance', (req, res) => maintenanceController.createMaintenance(req, res));
router.get('/maintenances', (req, res) => maintenanceController.listMaintenances(req, res));
router.get('/maintenance/stats', (req, res) => maintenanceController.getMaintenanceStats(req, res));
router.get('/maintenance/predictive', (req, res) => maintenanceController.predictiveAnalysis(req, res));
router.get('/maintenance/preventive', (req, res) => maintenanceController.getPreventiveSchedule(req, res));
router.post('/maintenance/corrective', (req, res) => maintenanceController.registerCorrectiveMaintenance(req, res));
exports.default = router;
