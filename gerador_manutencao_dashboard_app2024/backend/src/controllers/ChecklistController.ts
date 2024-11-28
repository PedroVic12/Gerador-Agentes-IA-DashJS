import { Request, Response } from 'express';
import SupabaseService from '../services/SupabaseService';

export class ChecklistController {
  async getChecklists(req: Request, res: Response) {
    try {
      const type = req.query.type as string;
      const checklists = await SupabaseService.getChecklists(type);
      res.json(checklists);
    } catch (error) {
      console.error('Error fetching checklists:', error);
      res.status(500).json({ error: 'Failed to fetch checklists' });
    }
  }

  async createChecklist(req: Request, res: Response) {
    try {
      const { type, item } = req.body;
      const checklist = await SupabaseService.saveChecklist(type, [item]);
      res.json(checklist);
    } catch (error) {
      console.error('Error creating checklist:', error);
      res.status(500).json({ error: 'Failed to create checklist' });
    }
  }

  async updateChecklistItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { completed } = req.body;
      const { data, error } = await SupabaseService.supabase
        .from('checklists')
        .update({ completed })
        .eq('id', id);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error updating checklist item:', error);
      res.status(500).json({ error: 'Failed to update checklist item' });
    }
  }

  async deleteChecklistItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await SupabaseService.supabase
        .from('checklists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      res.status(500).json({ error: 'Failed to delete checklist item' });
    }
  }

  async exportChecklists(req: Request, res: Response) {
    try {
      const filePath = await SupabaseService.exportTableToExcel('checklists');
      res.download(filePath);
    } catch (error) {
      console.error('Error exporting checklists:', error);
      res.status(500).json({ error: 'Failed to export checklists' });
    }
  }
}

export default new ChecklistController();
