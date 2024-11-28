import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import MaintenanceCard from '../components/MaintenanceCard';
import { DynamicChart } from '../components/DynamicChart';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

interface MaintenanceData {
  id: number;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE';
  title: string;
  description: string;
  date: string;
  status: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  failureRate?: number;
}

const MaintenanceDashboard: React.FC = () => {
  const [maintenances, setMaintenances] = useState<MaintenanceData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [maintenancesRes, statsRes, predictionsRes] = await Promise.all([
        axios.get(`${API_URL}/maintenances`),
        axios.get(`${API_URL}/maintenance/stats`),
        axios.get(`${API_URL}/maintenance/predictive`),
      ]);

      setMaintenances(maintenancesRes.data);
      setStats(statsRes.data);
      setPredictions(predictionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom sx={{ my: 4 }}>
        Dashboard de Manutenção
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Box p={3} bgcolor="background.paper" borderRadius={2}>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h4">{stats?.total || 0}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box p={3} bgcolor="#4CAF50" color="white" borderRadius={2}>
            <Typography variant="h6">Preventivas</Typography>
            <Typography variant="h4">{stats?.preventive?.count || 0}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box p={3} bgcolor="#f44336" color="white" borderRadius={2}>
            <Typography variant="h6">Corretivas</Typography>
            <Typography variant="h4">{stats?.corrective?.count || 0}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box p={3} bgcolor="#2196F3" color="white" borderRadius={2}>
            <Typography variant="h6">Preditivas</Typography>
            <Typography variant="h4">{stats?.predictive?.count || 0}</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Predictive Analysis Chart */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Análise Preditiva
        </Typography>
        {predictions && (
          <DynamicChart
            data={predictions.predictions.map((p: any) => ({
              date: new Date(p.date),
              value: p.predictedFailureRate,
            }))}
          />
        )}
      </Box>

      {/* Maintenance Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Manutenções Preventivas
          </Typography>
          {maintenances
            .filter((m) => m.type === 'PREVENTIVE')
            .map((maintenance) => (
              <MaintenanceCard
                key={maintenance.id}
                {...maintenance}
                onClick={() => setSelectedMaintenance(maintenance)}
              />
            ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Manutenções Corretivas
          </Typography>
          {maintenances
            .filter((m) => m.type === 'CORRECTIVE')
            .map((maintenance) => (
              <MaintenanceCard
                key={maintenance.id}
                {...maintenance}
                onClick={() => setSelectedMaintenance(maintenance)}
              />
            ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Manutenções Preditivas
          </Typography>
          {maintenances
            .filter((m) => m.type === 'PREDICTIVE')
            .map((maintenance) => (
              <MaintenanceCard
                key={maintenance.id}
                {...maintenance}
                onClick={() => setSelectedMaintenance(maintenance)}
              />
            ))}
        </Grid>
      </Grid>

      {/* Maintenance Details Dialog */}
      <Dialog
        open={!!selectedMaintenance}
        onClose={() => setSelectedMaintenance(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalhes da Manutenção</DialogTitle>
        <DialogContent>
          {selectedMaintenance && (
            <Box>
              <Typography variant="h6">{selectedMaintenance.title}</Typography>
              <Typography variant="body1" paragraph>
                {selectedMaintenance.description}
              </Typography>
              <Typography variant="body2">
                Status: {selectedMaintenance.status}
              </Typography>
              <Typography variant="body2">
                Prioridade: {selectedMaintenance.priority}
              </Typography>
              <Typography variant="body2">
                Data: {new Date(selectedMaintenance.date).toLocaleString('pt-BR')}
              </Typography>
              {selectedMaintenance.failureRate && (
                <Typography variant="body2">
                  Taxa de Falha: {selectedMaintenance.failureRate.toFixed(2)}%
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default MaintenanceDashboard;
