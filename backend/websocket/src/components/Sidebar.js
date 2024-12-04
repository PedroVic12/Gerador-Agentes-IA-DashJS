import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import AutomationIcon from '@mui/icons-material/AutoFixHigh';
import DataProcessingIcon from '@mui/icons-material/Storage';
import MachineLearningIcon from '@mui/icons-material/Psychology';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AgentsIcon from '@mui/icons-material/Groups';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Agentes IA', icon: <AgentsIcon />, path: '/agents' },
  { text: 'Automação', icon: <AutomationIcon />, path: '/automation' },
  { text: 'Processamento de Dados', icon: <DataProcessingIcon />, path: '/data-processing' },
  { text: 'Machine Learning', icon: <MachineLearningIcon />, path: '/machine-learning' },
];

const Sidebar = ({ onPageChange, currentPage }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1a237e',
          color: 'white',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', height: '100%' }}>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" component="div" sx={{ color: 'white' }}>
            AI Dashboard
          </Typography>
        </Box>
        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => onPageChange(item.path)}
              sx={{
                backgroundColor: currentPage === item.path ? 'rgba(255,255,255,0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.12)',
                },
                my: 0.5,
                mx: 1,
                borderRadius: 1,
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
