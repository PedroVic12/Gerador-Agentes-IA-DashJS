from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EquipmentViewSet, MaintenanceRecordViewSet

router = DefaultRouter()
router.register(r'equipment', EquipmentViewSet)
router.register(r'maintenance', MaintenanceRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
