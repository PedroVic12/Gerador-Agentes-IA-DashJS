"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const exceljs_1 = __importDefault(require("exceljs"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class SupabaseService {
    constructor() {
        this.exportsDir = path_1.default.join(__dirname, '../../../exports');
        const supabaseUrl = process.env.SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_KEY || '';
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        // Ensure exports directory exists
        if (!fs_1.default.existsSync(this.exportsDir)) {
            fs_1.default.mkdirSync(this.exportsDir, { recursive: true });
        }
    }
    async exportTableToExcel(tableName) {
        try {
            // Fetch data from Supabase
            const { data, error } = await this.supabase
                .from(tableName)
                .select('*');
            if (error)
                throw error;
            // Create new workbook
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
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${tableName}_${timestamp}.xlsx`;
            const filepath = path_1.default.join(this.exportsDir, filename);
            // Save workbook
            await workbook.xlsx.writeFile(filepath);
            return filepath;
        }
        catch (error) {
            console.error('Error exporting to Excel:', error);
            throw error;
        }
    }
    async getTableData(tableName) {
        const { data, error } = await this.supabase
            .from(tableName)
            .select('*');
        if (error)
            throw error;
        return data;
    }
    async saveChecklist(type, items) {
        const { data, error } = await this.supabase
            .from('checklists')
            .insert({ type, items });
        if (error)
            throw error;
        return data;
    }
    async getChecklists(type) {
        let query = this.supabase.from('checklists').select('*');
        if (type) {
            query = query.eq('type', type);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data;
    }
}
exports.SupabaseService = SupabaseService;
exports.default = new SupabaseService();
