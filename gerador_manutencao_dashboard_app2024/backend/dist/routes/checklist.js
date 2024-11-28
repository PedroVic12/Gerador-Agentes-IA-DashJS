"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ChecklistController_1 = __importDefault(require("../controllers/ChecklistController"));
const router = express_1.default.Router();
router.get('/checklists', (req, res) => ChecklistController_1.default.getChecklists(req, res));
router.post('/checklists', (req, res) => ChecklistController_1.default.createChecklist(req, res));
router.put('/checklists/:id', (req, res) => ChecklistController_1.default.updateChecklistItem(req, res));
router.delete('/checklists/:id', (req, res) => ChecklistController_1.default.deleteChecklistItem(req, res));
router.get('/export/checklists', (req, res) => ChecklistController_1.default.exportChecklists(req, res));
exports.default = router;
