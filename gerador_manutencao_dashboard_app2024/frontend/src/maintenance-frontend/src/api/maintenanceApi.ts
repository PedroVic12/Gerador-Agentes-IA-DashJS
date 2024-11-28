import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Tipos
export interface Equipment {
    id?: number;
    name: string;
    description: string;
    serial_number: string;
    installation_date: string;
}

export interface MaintenanceRecord {
    id?: number;
    equipment: number;
    equipment_name?: string;
    maintenance_type: 'preventive' | 'corrective';
    description: string;
    scheduled_date: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    technician: string;
    notes?: string;
}

// API Calls
export const equipmentApi = {
    getAll: () => axios.get<Equipment[]>(`${API_URL}/equipment/`),
    getById: (id: number) => axios.get<Equipment>(`${API_URL}/equipment/${id}/`),
    create: (data: Equipment) => axios.post<Equipment>(`${API_URL}/equipment/`, data),
    update: (id: number, data: Equipment) => axios.put<Equipment>(`${API_URL}/equipment/${id}/`, data),
    delete: (id: number) => axios.delete(`${API_URL}/equipment/${id}/`),
    getMaintenanceHistory: (id: number) => axios.get<MaintenanceRecord[]>(`${API_URL}/equipment/${id}/maintenance_history/`),
    getStatistics: () => axios.get(`${API_URL}/equipment/statistics/`),
};

export const maintenanceApi = {
    getAll: () => axios.get<MaintenanceRecord[]>(`${API_URL}/maintenance/`),
    getById: (id: number) => axios.get<MaintenanceRecord>(`${API_URL}/maintenance/${id}/`),
    create: (data: MaintenanceRecord) => axios.post<MaintenanceRecord>(`${API_URL}/maintenance/`, data),
    update: (id: number, data: MaintenanceRecord) => axios.put<MaintenanceRecord>(`${API_URL}/maintenance/${id}/`, data),
    delete: (id: number) => axios.delete(`${API_URL}/maintenance/${id}/`),
    getPending: () => axios.get<MaintenanceRecord[]>(`${API_URL}/maintenance/pending/`),
    getByStatus: (status: string) => axios.get<MaintenanceRecord[]>(`${API_URL}/maintenance/?status=${status}`),
    getByType: (type: string) => axios.get<MaintenanceRecord[]>(`${API_URL}/maintenance/?type=${type}`),
};
