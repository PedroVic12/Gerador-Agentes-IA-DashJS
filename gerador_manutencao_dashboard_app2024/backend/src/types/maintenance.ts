export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  PREDICTIVE = 'PREDICTIVE',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Maintenance {
  id: number;
  type: MaintenanceType;
  status: MaintenanceStatus;
  date: Date;
  description: string;
  equipmentId: number;
  technician: string;
  cost: number;
  duration: number; // em minutos
  failureRate?: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
