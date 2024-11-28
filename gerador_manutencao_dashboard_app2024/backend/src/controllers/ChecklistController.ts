import { Request, Response } from 'express';
import { SupabaseService } from '../services/SupabaseService';

export class ChecklistController extends SupabaseService {
  constructor() {
    super();
  }

  async getChecklists(req: Request, res: Response) {
    try {
      const data = await this.getData('checklists');
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching checklists' });
    }
  }

  async createChecklist(req: Request, res: Response) {
    try {
      const result = await this.insertData('checklists', req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error creating checklist' });
    }
  }

  async updateChecklist(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.updateData('checklists', parseInt(id), req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error updating checklist' });
    }
  }

  async updateChecklistItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { completed } = req.body;
      const { data, error } = await this.supabase
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
      const { error } = await this.supabase
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
      const filePath = await this.exportTableToExcel('checklists');
      res.download(filePath);
    } catch (error) {
      console.error('Error exporting checklists:', error);
      res.status(500).json({ error: 'Failed to export checklists' });
    }
  }
}

export default new ChecklistController();
