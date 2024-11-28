"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRepository = void 0;
const chokidar = __importStar(require("chokidar"));
const events_1 = require("events");
const exceljs_1 = __importDefault(require("exceljs"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const SupabaseService_1 = require("./SupabaseService");
class DataRepository extends SupabaseService_1.SupabaseService {
    constructor() {
        super();
        this.dataDir = path_1.default.join(__dirname, '../../../data');
        this.eventEmitter = new events_1.EventEmitter();
        this.watcher = chokidar.watch(this.dataDir, {
            ignored: /(^|[\/\\])\../,
            persistent: true
        });
        this.setupWatcher();
    }
    setupWatcher() {
        this.watcher
            .on('add', (path) => this.handleFileChange('add', path))
            .on('change', (path) => this.handleFileChange('change', path))
            .on('unlink', (path) => this.handleFileChange('unlink', path));
    }
    async handleFileChange(event, filePath) {
        try {
            const ext = path_1.default.extname(filePath).toLowerCase();
            if (!['.xlsx', '.csv', '.json'].includes(ext))
                return;
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
        }
        catch (error) {
            console.error('Error handling file change:', error);
        }
    }
    async processFile(filePath) {
        const ext = path_1.default.extname(filePath).toLowerCase();
        let data = [];
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
    async readExcel(filePath) {
        const workbook = new exceljs_1.default.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
        const data = [];
        worksheet === null || worksheet === void 0 ? void 0 : worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1)
                return; // Skip header row
            data.push(this.processRow(row.values));
        });
        return data;
    }
    async readCSV(filePath) {
        // Implement CSV reading logic
        return [];
    }
    async readJSON(filePath) {
        const content = await fs_1.default.promises.readFile(filePath, 'utf8');
        return JSON.parse(content);
    }
    async syncWithSupabase(data) {
        try {
            for (const row of data) {
                await this.insertData('maintenance_data', row);
            }
        }
        catch (error) {
            console.error('Error syncing with Supabase:', error);
        }
    }
    onFileChange(callback) {
        this.eventEmitter.on('fileChange', callback);
    }
    async exportToExcel(data, filename) {
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Data');
        // Add headers
        const headers = Object.keys(data[0] || {});
        worksheet.addRow(headers);
        // Add data
        data.forEach(row => {
            worksheet.addRow(Object.values(row));
        });
        // Create exports directory if it doesn't exist
        if (!fs_1.default.existsSync(this.exportsDir)) {
            fs_1.default.mkdirSync(this.exportsDir, { recursive: true });
        }
        const filePath = path_1.default.join(this.exportsDir, `${filename}.xlsx`);
        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }
}
exports.DataRepository = DataRepository;
