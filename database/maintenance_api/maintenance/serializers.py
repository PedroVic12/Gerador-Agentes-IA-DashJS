from rest_framework import serializers
from .models import Equipment, MaintenanceRecord

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'

class MaintenanceRecordSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    
    class Meta:
        model = MaintenanceRecord
        fields = [
            'id', 'equipment', 'equipment_name', 'maintenance_type',
            'description', 'scheduled_date', 'status', 'technician',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
        
    def validate_scheduled_date(self, value):
        """
        Validar se a data agendada não está no passado
        """
        from django.utils import timezone
        if value < timezone.now():
            raise serializers.ValidationError("Scheduled date cannot be in the past")
        return value
