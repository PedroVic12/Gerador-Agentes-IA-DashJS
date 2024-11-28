import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  Build as BuildIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

interface MaintenanceCardProps {
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE';
  title: string;
  description: string;
  date: string;
  status: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  failureRate?: number;
  onClick?: () => void;
}

const MaintenanceCard: React.FC<MaintenanceCardProps> = ({
  type,
  title,
  description,
  date,
  status,
  priority,
  failureRate,
  onClick,
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'PREVENTIVE':
        return <BuildIcon />;
      case 'CORRECTIVE':
        return <WarningIcon />;
      case 'PREDICTIVE':
        return <TimelineIcon />;
      default:
        return <BuildIcon />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'PREVENTIVE':
        return '#4CAF50';
      case 'CORRECTIVE':
        return '#f44336';
      case 'PREDICTIVE':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'HIGH':
        return '#f44336';
      case 'MEDIUM':
        return '#ff9800';
      case 'LOW':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  return (
    <Card
      sx={{
        minWidth: 300,
        maxWidth: 400,
        m: 1,
        cursor: 'pointer',
        transition: '0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 3,
        },
        borderLeft: `4px solid ${getTypeColor()}`,
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton size="small" sx={{ color: getTypeColor(), mr: 1 }}>
            {getTypeIcon()}
          </IconButton>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {description}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Chip
            label={status}
            size="small"
            sx={{ backgroundColor: '#e0e0e0' }}
          />
          <Chip
            label={priority}
            size="small"
            sx={{ backgroundColor: getPriorityColor(), color: 'white' }}
          />
        </Box>

        {type === 'PREDICTIVE' && failureRate !== undefined && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Taxa de Falha Prevista: {failureRate.toFixed(2)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={failureRate}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: failureRate > 70 ? '#f44336' : '#4CAF50',
                },
              }}
            />
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
          {new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MaintenanceCard;
