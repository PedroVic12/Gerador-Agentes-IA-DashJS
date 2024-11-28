"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistController = void 0;
const SupabaseService_1 = __importDefault(require("../services/SupabaseService"));
class ChecklistController {
    async getChecklists(req, res) {
        try {
            const type = req.query.type;
            const checklists = await SupabaseService_1.default.getChecklists(type);
            res.json(checklists);
        }
        catch (error) {
            console.error('Error fetching checklists:', error);
            res.status(500).json({ error: 'Failed to fetch checklists' });
        }
    }
    async createChecklist(req, res) {
        try {
            const { type, item } = req.body;
            const checklist = await SupabaseService_1.default.saveChecklist(type, [item]);
            res.json(checklist);
        }
        catch (error) {
            console.error('Error creating checklist:', error);
            res.status(500).json({ error: 'Failed to create checklist' });
        }
    }
    async updateChecklistItem(req, res) {
        try {
            const { id } = req.params;
            const { completed } = req.body;
            const { data, error } = await SupabaseService_1.default.supabase
                .from('checklists')
                .update({ completed })
                .eq('id', id);
            if (error)
                throw error;
            res.json(data);
        }
        catch (error) {
            console.error('Error updating checklist item:', error);
            res.status(500).json({ error: 'Failed to update checklist item' });
        }
    }
    async deleteChecklistItem(req, res) {
        try {
            const { id } = req.params;
            const { error } = await SupabaseService_1.default.supabase
                .from('checklists')
                .delete()
                .eq('id', id);
            if (error)
                throw error;
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error deleting checklist item:', error);
            res.status(500).json({ error: 'Failed to delete checklist item' });
        }
    }
    async exportChecklists(req, res) {
        try {
            const filePath = await SupabaseService_1.default.exportTableToExcel('checklists');
            res.download(filePath);
        }
        catch (error) {
            console.error('Error exporting checklists:', error);
            res.status(500).json({ error: 'Failed to export checklists' });
        }
    }
}
exports.ChecklistController = ChecklistController;
exports.default = new ChecklistController();
