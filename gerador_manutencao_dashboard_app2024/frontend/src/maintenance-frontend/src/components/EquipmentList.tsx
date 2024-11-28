import React, { useEffect, useState } from 'react';
import { Equipment, equipmentApi } from '../api/maintenanceApi';

const EquipmentList: React.FC = () => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        loadEquipment();
    }, []);
    
    const loadEquipment = async () => {
        try {
            setLoading(true);
            const response = await equipmentApi.getAll();
            setEquipment(response.data);
        } catch (err) {
            setError('Failed to load equipment');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this equipment?')) {
            try {
                await equipmentApi.delete(id);
                setEquipment(equipment.filter(e => e.id !== id));
            } catch (err) {
                setError('Failed to delete equipment');
                console.error(err);
            }
        }
    };
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <div>
            <h2>Equipment List</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Serial Number</th>
                        <th>Installation Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {equipment.map(item => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.serial_number}</td>
                            <td>{item.installation_date}</td>
                            <td>
                                <button onClick={() => handleDelete(item.id!)}>Delete</button>
                                {/* Add edit button and functionality */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EquipmentList;
