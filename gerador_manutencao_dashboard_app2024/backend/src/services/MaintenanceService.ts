import { PrismaClient } from '@prisma/client';
import { MaintenanceType, MaintenanceStatus } from '../types/maintenance';
import { SupabaseService } from './SupabaseService';

export class MaintenanceService extends SupabaseService {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // Criar novo registro de manutenção
  async create(data: any) {
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
        where: { type: MaintenanceType.PREVENTIVE },
      }),
      this.prisma.maintenance.count({
        where: { type: MaintenanceType.CORRECTIVE },
      }),
      this.prisma.maintenance.count({
        where: { type: MaintenanceType.PREDICTIVE },
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
        type: MaintenanceType.PREVENTIVE,
        date: {
          gte: today,
          lt: nextMonth,
        },
        status: MaintenanceStatus.SCHEDULED,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  // Criar manutenção corretiva
  async createCorrective(data: any) {
    return this.prisma.maintenance.create({
      data: {
        ...data,
        type: MaintenanceType.CORRECTIVE,
        date: new Date(data.date),
        status: MaintenanceStatus.IN_PROGRESS,
      },
    });
  }

  // Criar manutenção preditiva baseada em análise
  async createPredictive(data: any) {
    return this.prisma.maintenance.create({
      data: {
        ...data,
        type: MaintenanceType.PREDICTIVE,
        date: new Date(data.date),
        status: MaintenanceStatus.SCHEDULED,
      },
    });
  }

  async getData(tableName: string) {
    return this.getData(tableName);
  }

  async exportToExcel(data: any[], filename: string): Promise<string> {
    return this.exportToExcel(data, filename);
  }

  async predictMaintenanceNeeds(equipmentId: string) {
    const data = await this.getData('maintenance_history');
    // Implementar lógica de predição
    return {
      nextMaintenanceDate: new Date(),
      confidence: 0.85
    };
  }

  async registerMaintenance(data: {
    equipmentId: string;
    date: Date;
    type: 'preventive' | 'corrective';
    description: string;
  }) {
    return this.insertData('maintenance_history', data);
  }

  async getMaintenanceHistory(equipmentId: string) {
    const { data, error } = await this.supabase
      .from('maintenance_history')
      .select('*')
      .eq('equipmentId', equipmentId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  }
}
