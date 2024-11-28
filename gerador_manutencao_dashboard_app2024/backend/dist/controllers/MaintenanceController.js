"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceController = void 0;
const ml_regression_simple_linear_1 = require("ml-regression-simple-linear");
const MaintenanceService_1 = require("../services/MaintenanceService");
class MaintenanceController {
    constructor() {
        this.maintenanceService = new MaintenanceService_1.MaintenanceService();
    }
    // Criar novo registro de manutenção
    async createMaintenance(req, res) {
        try {
            const maintenanceData = req.body;
            const result = await this.maintenanceService.create(maintenanceData);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao criar registro de manutenção' });
        }
    }
    // Listar todas as manutenções
    async listMaintenances(req, res) {
        try {
            const maintenances = await this.maintenanceService.findAll();
            res.json(maintenances);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao listar manutenções' });
        }
    }
    // Análise preditiva de manutenção
    async predictiveAnalysis(req, res) {
        try {
            const historicalData = await this.maintenanceService.getHistoricalData();
            // Preparar dados para regressão linear
            const xValues = historicalData.map(d => new Date(d.date).getTime());
            const yValues = historicalData.map(d => d.failureRate);
            // Criar e treinar modelo de regressão linear
            const regression = new ml_regression_simple_linear_1.LinearRegression(xValues, yValues);
            // Fazer previsão para próximos 30 dias
            const today = new Date();
            const predictions = Array.from({ length: 30 }, (_, i) => {
                const futureDate = new Date(today);
                futureDate.setDate(today.getDate() + i);
                return {
                    date: futureDate.toISOString(),
                    predictedFailureRate: regression.predict(futureDate.getTime())
                };
            });
            res.json({
                predictions,
                r2: regression.score(), // Coeficiente de determinação (R²)
                equation: {
                    slope: regression.slope,
                    intercept: regression.intercept
                }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Erro na análise preditiva' });
        }
    }
    // Estatísticas de manutenção
    async getMaintenanceStats(req, res) {
        try {
            const stats = await this.maintenanceService.calculateStats();
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao calcular estatísticas' });
        }
    }
    // Manutenções preventivas agendadas
    async getPreventiveSchedule(req, res) {
        try {
            const schedule = await this.maintenanceService.getPreventiveSchedule();
            res.json(schedule);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao obter agenda preventiva' });
        }
    }
    // Registrar manutenção corretiva
    async registerCorrectiveMaintenance(req, res) {
        try {
            const maintenanceData = req.body;
            const result = await this.maintenanceService.createCorrective(maintenanceData);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao registrar manutenção corretiva' });
        }
    }
}
exports.MaintenanceController = MaintenanceController;
