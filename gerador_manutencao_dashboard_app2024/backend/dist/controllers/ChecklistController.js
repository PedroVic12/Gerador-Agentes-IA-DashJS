"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistController = void 0;
const SupabaseService_1 = require("../services/SupabaseService");
class ChecklistController extends SupabaseService_1.SupabaseService {
    constructor() {
        super();
    }
    async getChecklists(req, res) {
        try {
            const data = await this.getData('checklists');
            res.json(data);
        }
        catch (error) {
            res.status(500).json({ error: 'Error fetching checklists' });
        }
    }
    async createChecklist(req, res) {
        try {
            const result = await this.insertData('checklists', req.body);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(500).json({ error: 'Error creating checklist' });
        }
    }
    async updateChecklist(req, res) {
        try {
            const { id } = req.params;
            const result = await this.updateData('checklists', parseInt(id), req.body);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: 'Error updating checklist' });
        }
    }
    async updateChecklistItem(req, res) {
        try {
            const { id } = req.params;
            const { completed } = req.body;
            const { data, error } = await this.supabase
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
            const { error } = await this.supabase
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
            const filePath = await this.exportTableToExcel('checklists');
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
