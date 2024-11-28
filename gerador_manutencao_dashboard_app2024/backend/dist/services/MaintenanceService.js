"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceService = void 0;
const client_1 = require("@prisma/client");
const maintenance_1 = require("../types/maintenance");
const SupabaseService_1 = require("./SupabaseService");
class MaintenanceService extends SupabaseService_1.SupabaseService {
    constructor() {
        super();
        this.prisma = new client_1.PrismaClient();
    }
    // Criar novo registro de manutenção
    async create(data) {
        return this.prisma.maintenance.create({
            data: {
                ...data,
                date: new Date(data.date),
            },
        });
    }
    // Buscar todas as manutenções
    async findAll() {
        return this.prisma.maintenance.findMany({
            orderBy: { date: 'desc' },
        });
    }
    // Obter dados históricos para análise preditiva
    async getHistoricalData() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return this.prisma.maintenance.findMany({
            where: {
                date: {
                    gte: sixMonthsAgo,
                },
            },
            orderBy: {
                date: 'asc',
            },
        });
    }
    // Calcular estatísticas de manutenção
    async calculateStats() {
        const [preventive, corrective, predictive] = await Promise.all([
            this.prisma.maintenance.count({
                where: { type: maintenance_1.MaintenanceType.PREVENTIVE },
            }),
            this.prisma.maintenance.count({
                where: { type: maintenance_1.MaintenanceType.CORRECTIVE },
            }),
            this.prisma.maintenance.count({
                where: { type: maintenance_1.MaintenanceType.PREDICTIVE },
            }),
        ]);
        const total = preventive + corrective + predictive;
        return {
            total,
            preventive: {
                count: preventive,
                percentage: (preventive / total) * 100,
            },
            corrective: {
                count: corrective,
                percentage: (corrective / total) * 100,
            },
            predictive: {
                count: predictive,
                percentage: (predictive / total) * 100,
            },
            efficiency: ((preventive + predictive) / total) * 100,
        };
    }
    // Obter agenda de manutenções preventivas
    async getPreventiveSchedule() {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);
        return this.prisma.maintenance.findMany({
            where: {
                type: maintenance_1.MaintenanceType.PREVENTIVE,
                date: {
                    gte: today,
                    lt: nextMonth,
                },
                status: maintenance_1.MaintenanceStatus.SCHEDULED,
            },
            orderBy: {
                date: 'asc',
            },
        });
    }
    // Criar manutenção corretiva
    async createCorrective(data) {
        return this.prisma.maintenance.create({
            data: {
                ...data,
                type: maintenance_1.MaintenanceType.CORRECTIVE,
                date: new Date(data.date),
                status: maintenance_1.MaintenanceStatus.IN_PROGRESS,
            },
        });
    }
    // Criar manutenção preditiva baseada em análise
    async createPredictive(data) {
        return this.prisma.maintenance.create({
            data: {
                ...data,
                type: maintenance_1.MaintenanceType.PREDICTIVE,
                date: new Date(data.date),
                status: maintenance_1.MaintenanceStatus.SCHEDULED,
            },
        });
    }
    async getData(tableName) {
        return this.getData(tableName);
    }
    async exportToExcel(data, filename) {
        return this.exportToExcel(data, filename);
    }
    async predictMaintenanceNeeds(equipmentId) {
        const data = await this.getData('maintenance_history');
        // Implementar lógica de predição
        return {
            nextMaintenanceDate: new Date(),
            confidence: 0.85
        };
    }
    async registerMaintenance(data) {
        return this.insertData('maintenance_history', data);
    }
    async getMaintenanceHistory(equipmentId) {
        const { data, error } = await this.supabase
            .from('maintenance_history')
            .select('*')
            .eq('equipmentId', equipmentId)
            .order('date', { ascending: false });
        if (error)
            throw error;
        return data;
    }
}
exports.MaintenanceService = MaintenanceService;
