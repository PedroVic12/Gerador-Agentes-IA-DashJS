import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export class SupabaseService {
  protected supabase: SupabaseClient;
  protected exportsDir = path.join(__dirname, '../../../exports');

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Ensure exports directory exists
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  async exportTableToExcel(tableName: string): Promise<string> {
    try {
      // Fetch data from Supabase
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*');

      if (error) throw error;

      // Create new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(tableName);

      if (data && data.length > 0) {
        // Add headers
        const headers = Object.keys(data[0]);
        worksheet.addRow(headers);

        // Add data
        data.forEach(row => {
          worksheet.addRow(Object.values(row));
        });

        // Style headers
        worksheet.getRow(1).font = { bold: true };
        worksheet.columns.forEach(column => {
          column.width = 15;
        });
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${tableName}_${timestamp}.xlsx`;
      const filepath = path.join(this.exportsDir, filename);

      // Save workbook
      await workbook.xlsx.writeFile(filepath);

      return filepath;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }

  async getTableData(tableName: string) {
    const { data, error } = await this.supabase
      .from(tableName)
      .select('*');

    if (error) throw error;
    return data;
  }

  async saveChecklist(type: string, items: any[]) {
    const { data, error } = await this.supabase
      .from('checklists')
      .insert({ type, items });

    if (error) throw error;
    return data;
  }

  async getChecklists(type?: string) {
    let query = this.supabase.from('checklists').select('*');
    if (type) {
      query = query.eq('type', type);
    }
    const { data, error } = await query;

    if (error) throw error;
    return data;
  }
}

export default new SupabaseService();
