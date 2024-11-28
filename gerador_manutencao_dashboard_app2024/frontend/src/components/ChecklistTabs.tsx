import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Paper,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import Plot from 'react-plotly.js';
import axios from 'axios';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistType {
  id: string;
  name: string;
  items: ChecklistItem[];
}

const API_URL = 'http://localhost:3001/api';

export const ChecklistTabs: React.FC = () => {
  const [value, setValue] = useState(0);
  const [checklistTypes, setChecklistTypes] = useState<ChecklistType[]>([
    { id: 'maintenance', name: 'Manutenção', items: [] },
    { id: 'development', name: 'Desenvolvimento', items: [] },
    { id: 'employees', name: 'Funcionários', items: [] },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetchChecklists();
    updateChart();
  }, []);

  const fetchChecklists = async () => {
    try {
      const response = await axios.get(`${API_URL}/checklists`);
      const data = response.data;
      
      // Update checklist types with fetched data
      setChecklistTypes(prev => 
        prev.map(type => ({
          ...type,
          items: data.filter((item: any) => item.type === type.id)
        }))
      );
    } catch (error) {
      console.error('Error fetching checklists:', error);
    }
  };

  const updateChart = () => {
    const completionData = checklistTypes.map(type => ({
      type: type.name,
      total: type.items.length,
      completed: type.items.filter(item => item.completed).length,
    }));

    setChartData({
      data: [{
        values: completionData.map(d => d.completed),
        labels: completionData.map(d => d.type),
        type: 'pie',
      }],
      layout: {
        height: 400,
        width: 500,
        title: 'Progresso dos Checklists',
      },
    });
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleToggleItem = async (typeIndex: number, itemIndex: number) => {
    const newTypes = [...checklistTypes];
    newTypes[typeIndex].items[itemIndex].completed = 
      !newTypes[typeIndex].items[itemIndex].completed;
    
    setChecklistTypes(newTypes);
    updateChart();

    try {
      await axios.put(`${API_URL}/checklists/${newTypes[typeIndex].items[itemIndex].id}`, {
        completed: newTypes[typeIndex].items[itemIndex].completed,
      });
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    const currentType = checklistTypes[value];
    const newItem = {
      id: Date.now().toString(),
      text: newItemText,
      completed: false,
    };

    try {
      const response = await axios.post(`${API_URL}/checklists`, {
        type: currentType.id,
        item: newItem,
      });

      const updatedTypes = [...checklistTypes];
      updatedTypes[value].items.push(response.data);
      setChecklistTypes(updatedTypes);
      updateChart();
      setNewItemText('');
      setOpenDialog(false);
    } catch (error) {
      console.error('Error adding checklist item:', error);
    }
  };

  const handleDeleteItem = async (typeIndex: number, itemIndex: number) => {
    const item = checklistTypes[typeIndex].items[itemIndex];

    try {
      await axios.delete(`${API_URL}/checklists/${item.id}`);

      const newTypes = [...checklistTypes];
      newTypes[typeIndex].items.splice(itemIndex, 1);
      setChecklistTypes(newTypes);
      updateChart();
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axios.get(`${API_URL}/export/checklists`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'checklists.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Checklists
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
          >
            Exportar Excel
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange}>
            {checklistTypes.map((type) => (
              <Tab key={type.id} label={type.name} />
            ))}
          </Tabs>
        </Box>

        {checklistTypes.map((type, typeIndex) => (
          <Box
            key={type.id}
            role="tabpanel"
            hidden={value !== typeIndex}
            sx={{ mt: 2 }}
          >
            {value === typeIndex && (
              <>
                <List>
                  {type.items.map((item, itemIndex) => (
                    <ListItem
                      key={item.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteItem(typeIndex, itemIndex)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={item.completed}
                          onChange={() => handleToggleItem(typeIndex, itemIndex)}
                        />
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </List>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Adicionar Item
                </Button>
              </>
            )}
          </Box>
        ))}

        {chartData && (
          <Box sx={{ mt: 4 }}>
            <Plot
              data={chartData.data}
              layout={chartData.layout}
            />
          </Box>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Adicionar Novo Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Texto do Item"
            fullWidth
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddItem}>Adicionar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChecklistTabs;
