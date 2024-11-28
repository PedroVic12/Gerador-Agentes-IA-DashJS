import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';
import fs from 'fs';
import csv from 'csv-parser';
import { Transform } from 'stream';
import path from 'path';
import chokidar from 'chokidar';
import { EventEmitter } from 'events';

export class DataRepository extends EventEmitter {
  private supabase;
  private watchedFiles: Map<string, string> = new Map(); // filepath -> lastHash
  private dataDir: string;
  private watcher: chokidar.FSWatcher;

  constructor() {
    super();
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.dataDir = path.join(__dirname, '../../../data');
    
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Initialize file watcher
    this.watcher = chokidar.watch(this.dataDir, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    this.setupWatcher();
  }

  private setupWatcher() {
    this.watcher
      .on('add', path => this.handleFileChange('add', path))
      .on('change', path => this.handleFileChange('change', path))
      .on('unlink', path => this.handleFileChange('delete', path));
  }

  private async handleFileChange(event: 'add' | 'change' | 'delete', filepath: string) {
    const ext = path.extname(filepath).toLowerCase();
    const tableName = path.basename(filepath, ext);

    try {
      if (event === 'delete') {
        await this.clearTable(tableName);
        this.emit('dataChanged', { event, table: tableName });
        return;
      }

      let data: any[] = [];
      switch (ext) {
        case '.xlsx':
          data = await this.readExcelFile(filepath);
          break;
        case '.csv':
          data = await this.readCsvFile(filepath);
          break;
        case '.json':
          data = await this.readJsonFile(filepath);
          break;
        default:
          console.warn(`Unsupported file type: ${ext}`);
          return;
      }

      await this.syncDataWithSupabase(tableName, data);
      this.emit('dataChanged', { event, table: tableName, data });
    } catch (error) {
      console.error(`Error handling file change for ${filepath}:`, error);
      this.emit('error', error);
    }
  }

  private async readExcelFile(filepath: string): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filepath);
    const worksheet = workbook.worksheets[0];
    
    const headers = worksheet.getRow(1).values as string[];
    const data: any[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        rowData[headers[colNumber]] = cell.value;
      });
      data.push(rowData);
    });

    return data;
  }

  private async readCsvFile(filepath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const data: any[] = [];
      fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', () => resolve(data))
        .on('error', reject);
    });
  }

  private async readJsonFile(filepath: string): Promise<any[]> {
    const content = await fs.promises.readFile(filepath, 'utf8');
    return JSON.parse(content);
  }

  private async syncDataWithSupabase(tableName: string, data: any[]) {
    try {
      // Clear existing data
      await this.clearTable(tableName);

      // Insert new data
      const { error } = await this.supabase
        .from(tableName)
        .insert(data);

      if (error) throw error;
    } catch (error) {
      console.error(`Error syncing data for table ${tableName}:`, error);
      throw error;
    }
  }

  private async clearTable(tableName: string) {
    try {
      const { error } = await this.supabase
        .from(tableName)
        .delete()
        .neq('id', 0); // Delete all rows

      if (error) throw error;
    } catch (error) {
      console.error(`Error clearing table ${tableName}:`, error);
      throw error;
    }
  }

  async exportToExcel(tableName: string, filepath: string) {
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*');

      if (error) throw error;

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

      await workbook.xlsx.writeFile(filepath);
    } catch (error) {
      console.error(`Error exporting ${tableName} to Excel:`, error);
      throw error;
    }
  }

  async exportToCsv(tableName: string, filepath: string) {
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*');

      if (error) throw error;

      if (!data || data.length === 0) {
        await fs.promises.writeFile(filepath, '');
        return;
      }

      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      const content = [headers, ...rows].join('\n');

      await fs.promises.writeFile(filepath, content);
    } catch (error) {
      console.error(`Error exporting ${tableName} to CSV:`, error);
      throw error;
    }
  }

  async exportToJson(tableName: string, filepath: string) {
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*');

      if (error) throw error;

      await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error exporting ${tableName} to JSON:`, error);
      throw error;
    }
  }

  // Cleanup
  close() {
    this.watcher.close();
  }
}

export default new DataRepository();
