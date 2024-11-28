from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from .models import Equipment, MaintenanceRecord
from .serializers import EquipmentSerializer, MaintenanceRecordSerializer

class EquipmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar equipamentos.
    Suporta CRUD completo (Create, Read, Update, Delete).
    """
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    
    @action(detail=True, methods=['get'])
    def maintenance_history(self, request, pk=None):
        """
        Retorna o histórico de manutenção de um equipamento específico
        """
        equipment = self.get_object()
        maintenance_records = equipment.maintenance_records.all().order_by('-scheduled_date')
        serializer = MaintenanceRecordSerializer(maintenance_records, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Retorna estatísticas gerais dos equipamentos
        """
        total_equipment = Equipment.objects.count()
        maintenance_stats = MaintenanceRecord.objects.values('status').annotate(
            count=Count('id')
        )
        
        return Response({
            'total_equipment': total_equipment,
            'maintenance_stats': maintenance_stats
        })

class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gerenciar registros de manutenção.
    Suporta CRUD completo (Create, Read, Update, Delete).
    """
    queryset = MaintenanceRecord.objects.all()
    serializer_class = MaintenanceRecordSerializer
    
    def get_queryset(self):
        """
        Permite filtrar registros por status e tipo de manutenção
        """
        queryset = MaintenanceRecord.objects.all()
        status = self.request.query_params.get('status', None)
        maintenance_type = self.request.query_params.get('type', None)
        
        if status:
            queryset = queryset.filter(status=status)
        if maintenance_type:
            queryset = queryset.filter(maintenance_type=maintenance_type)
            
        return queryset.order_by('-scheduled_date')
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Retorna todas as manutenções pendentes
        """
        pending_records = MaintenanceRecord.objects.filter(
            status='pending'
        ).order_by('scheduled_date')
        serializer = self.get_serializer(pending_records, many=True)
        return Response(serializer.data)
