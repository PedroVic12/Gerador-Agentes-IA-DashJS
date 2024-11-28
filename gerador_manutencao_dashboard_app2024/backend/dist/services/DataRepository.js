"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRepository = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const exceljs_1 = __importDefault(require("exceljs"));
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const path_1 = __importDefault(require("path"));
const chokidar_1 = __importDefault(require("chokidar"));
const events_1 = require("events");
class DataRepository extends events_1.EventEmitter {
    constructor() {
        super();
        this.watchedFiles = new Map(); // filepath -> lastHash
        const supabaseUrl = process.env.SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_KEY || '';
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        this.dataDir = path_1.default.join(__dirname, '../../../data');
        // Ensure data directory exists
        if (!fs_1.default.existsSync(this.dataDir)) {
            fs_1.default.mkdirSync(this.dataDir, { recursive: true });
        }
        // Initialize file watcher
        this.watcher = chokidar_1.default.watch(this.dataDir, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true
        });
        this.setupWatcher();
    }
    setupWatcher() {
        this.watcher
            .on('add', path => this.handleFileChange('add', path))
            .on('change', path => this.handleFileChange('change', path))
            .on('unlink', path => this.handleFileChange('delete', path));
    }
    async handleFileChange(event, filepath) {
        const ext = path_1.default.extname(filepath).toLowerCase();
        const tableName = path_1.default.basename(filepath, ext);
        try {
            if (event === 'delete') {
                await this.clearTable(tableName);
                this.emit('dataChanged', { event, table: tableName });
                return;
            }
            let data = [];
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
        }
        catch (error) {
            console.error(`Error handling file change for ${filepath}:`, error);
            this.emit('error', error);
        }
    }
    async readExcelFile(filepath) {
        const workbook = new exceljs_1.default.Workbook();
        await workbook.xlsx.readFile(filepath);
        const worksheet = workbook.worksheets[0];
        const headers = worksheet.getRow(1).values;
        const data = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1)
                return; // Skip header row
            const rowData = {};
            row.eachCell((cell, colNumber) => {
                rowData[headers[colNumber]] = cell.value;
            });
            data.push(rowData);
        });
        return data;
    }
    async readCsvFile(filepath) {
        return new Promise((resolve, reject) => {
            const data = [];
            fs_1.default.createReadStream(filepath)
                .pipe((0, csv_parser_1.default)())
                .on('data', (row) => data.push(row))
                .on('end', () => resolve(data))
                .on('error', reject);
        });
    }
    async readJsonFile(filepath) {
        const content = await fs_1.default.promises.readFile(filepath, 'utf8');
        return JSON.parse(content);
    }
    async syncDataWithSupabase(tableName, data) {
        try {
            // Clear existing data
            await this.clearTable(tableName);
            // Insert new data
            const { error } = await this.supabase
                .from(tableName)
                .insert(data);
            if (error)
                throw error;
        }
        catch (error) {
            console.error(`Error syncing data for table ${tableName}:`, error);
            throw error;
        }
    }
    async clearTable(tableName) {
        try {
            const { error } = await this.supabase
                .from(tableName)
                .delete()
                .neq('id', 0); // Delete all rows
            if (error)
                throw error;
        }
        catch (error) {
            console.error(`Error clearing table ${tableName}:`, error);
            throw error;
        }
    }
    async exportToExcel(tableName, filepath) {
        try {
            const { data, error } = await this.supabase
                .from(tableName)
                .select('*');
            if (error)
                throw error;
            const workbook = new exceljs_1.default.Workbook();
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
        }
        catch (error) {
            console.error(`Error exporting ${tableName} to Excel:`, error);
            throw error;
        }
    }
    async exportToCsv(tableName, filepath) {
        try {
            const { data, error } = await this.supabase
                .from(tableName)
                .select('*');
            if (error)
                throw error;
            if (!data || data.length === 0) {
                await fs_1.default.promises.writeFile(filepath, '');
                return;
            }
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row => Object.values(row).join(','));
            const content = [headers, ...rows].join('\n');
            await fs_1.default.promises.writeFile(filepath, content);
        }
        catch (error) {
            console.error(`Error exporting ${tableName} to CSV:`, error);
            throw error;
        }
    }
    async exportToJson(tableName, filepath) {
        try {
            const { data, error } = await this.supabase
                .from(tableName)
                .select('*');
            if (error)
                throw error;
            await fs_1.default.promises.writeFile(filepath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error(`Error exporting ${tableName} to JSON:`, error);
            throw error;
        }
    }
    // Cleanup
    close() {
        this.watcher.close();
    }
}
exports.DataRepository = DataRepository;
exports.default = new DataRepository();
