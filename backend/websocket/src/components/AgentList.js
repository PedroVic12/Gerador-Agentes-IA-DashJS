import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const AgentList = ({ agents, onSelectAgent, onEditAgent, onDeleteAgent }) => {
  return (
    <Grid container spacing={2}>
      {agents.map((agent) => (
        <Grid item xs={12} sm={6} md={4} key={agent.id}>
          <Paper
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                gap: 1,
              }}
            >
              <IconButton
                size="small"
                onClick={() => onEditAgent(agent)}
                color="primary"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDeleteAgent(agent.id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            <Typography variant="h6" gutterBottom>
              {agent.name}
            </Typography>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              {agent.role}
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Objetivo:</strong> {agent.goal}
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Contexto:</strong> {agent.backstory}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => onSelectAgent(agent)}
            >
              Selecionar Agente
            </Button>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default AgentList;
