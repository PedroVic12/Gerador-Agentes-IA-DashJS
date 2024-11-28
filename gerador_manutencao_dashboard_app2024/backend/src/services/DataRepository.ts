import { SupabaseClient } from '@supabase/supabase-js';
import * as chokidar from 'chokidar';
import { EventEmitter } from 'events';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { SupabaseService } from './SupabaseService';

export class DataRepository extends SupabaseService {
  private watcher: chokidar.FSWatcher;
  private eventEmitter: EventEmitter;
  private dataDir: string;

  constructor() {
    super();
    this.dataDir = path.join(__dirname, '../../../data');
    this.eventEmitter = new EventEmitter();
    this.watcher = chokidar.watch(this.dataDir, {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    this.setupWatcher();
  }

  private setupWatcher() {
    this.watcher
      .on('add', (path: string) => this.handleFileChange('add', path))
      .on('change', (path: string) => this.handleFileChange('change', path))
      .on('unlink', (path: string) => this.handleFileChange('unlink', path));
  }

  private async handleFileChange(event: string, filePath: string) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      if (!['.xlsx', '.csv', '.json'].includes(ext)) return;

      switch (event) {
        case 'add':
        case 'change':
          await this.processFile(filePath);
          break;
        case 'unlink':
          // Handle file deletion
          break;
      }

      this.eventEmitter.emit('fileChange', { event, path: filePath });
    } catch (error) {
      console.error('Error handling file change:', error);
    }
  }

  private async processFile(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    let data: any[] = [];

    switch (ext) {
      case '.xlsx':
        data = await this.readExcel(filePath);
        break;
      case '.csv':
        data = await this.readCSV(filePath);
        break;
      case '.json':
        data = await this.readJSON(filePath);
        break;
    }

    await this.syncWithSupabase(data);
  }

  private async readExcel(filePath: string): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    const data: any[] = [];

    worksheet?.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      data.push(this.processRow(row.values));
    });

    return data;
  }

  private async readCSV(filePath: string): Promise<any[]> {
    // Implement CSV reading logic
    return [];
  }

  private async readJSON(filePath: string): Promise<any[]> {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(content);
  }

  private async syncWithSupabase(data: any[]) {
    try {
      for (const row of data) {
        await this.insertData('maintenance_data', row);
      }
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
    }
  }

  public onFileChange(callback: (event: { event: string, path: string }) => void) {
    this.eventEmitter.on('fileChange', callback);
  }

  public async exportToExcel(data: any[], filename: string): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Add headers
    const headers = Object.keys(data[0] || {});
    worksheet.addRow(headers);

    // Add data
    data.forEach(row => {
      worksheet.addRow(Object.values(row));
    });

    // Create exports directory if it doesn't exist
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }

    const filePath = path.join(this.exportsDir, `${filename}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }
}
