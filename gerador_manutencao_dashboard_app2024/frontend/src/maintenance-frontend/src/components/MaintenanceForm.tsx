import React, { useState, useEffect } from 'react';
import { Equipment, MaintenanceRecord, equipmentApi, maintenanceApi } from '../api/maintenanceApi';

interface MaintenanceFormProps {
    onSubmit: () => void;
    maintenanceRecord?: MaintenanceRecord;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ onSubmit, maintenanceRecord }) => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [formData, setFormData] = useState<Partial<MaintenanceRecord>>({
        equipment: 0,
        maintenance_type: 'preventive',
        description: '',
        scheduled_date: '',
        status: 'pending',
        technician: '',
        notes: ''
    });
    
    useEffect(() => {
        loadEquipment();
        if (maintenanceRecord) {
            setFormData(maintenanceRecord);
        }
    }, [maintenanceRecord]);
    
    const loadEquipment = async () => {
        try {
            const response = await equipmentApi.getAll();
            setEquipment(response.data);
        } catch (err) {
            console.error('Failed to load equipment:', err);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (maintenanceRecord?.id) {
                await maintenanceApi.update(maintenanceRecord.id, formData as MaintenanceRecord);
            } else {
                await maintenanceApi.create(formData as MaintenanceRecord);
            }
            onSubmit();
        } catch (err) {
            console.error('Failed to save maintenance record:', err);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Equipment:</label>
                <select
                    name="equipment"
                    value={formData.equipment}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Equipment</option>
                    {equipment.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>
            </div>
            
            <div>
                <label>Type:</label>
                <select
                    name="maintenance_type"
                    value={formData.maintenance_type}
                    onChange={handleChange}
                    required
                >
                    <option value="preventive">Preventive</option>
                    <option value="corrective">Corrective</option>
                </select>
            </div>
            
            <div>
                <label>Description:</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
            </div>
            
            <div>
                <label>Scheduled Date:</label>
                <input
                    type="datetime-local"
                    name="scheduled_date"
                    value={formData.scheduled_date}
                    onChange={handleChange}
                    required
                />
            </div>
            
            <div>
                <label>Technician:</label>
                <input
                    type="text"
                    name="technician"
                    value={formData.technician}
                    onChange={handleChange}
                    required
                />
            </div>
            
            <div>
                <label>Notes:</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                />
            </div>
            
            <button type="submit">
                {maintenanceRecord ? 'Update' : 'Create'} Maintenance Record
            </button>
        </form>
    );
};

export default MaintenanceForm;
