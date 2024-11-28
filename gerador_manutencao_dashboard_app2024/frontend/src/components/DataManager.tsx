import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { socket } from '../services/socket';

const API_URL = 'http://localhost:3001/api';

interface DataRow {
  id: string | number;
  [key: string]: any;
}

export const DataManager: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [openUpload, setOpenUpload] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' as 'error' | 'info' | 'success' });
  const [editRow, setEditRow] = useState<DataRow | null>(null);

  useEffect(() => {
    // Listen for real-time updates
    socket.on('dataChanged', ({ table, data }) => {
      if (table === selectedTable) {
        refreshData();
      }
    });

    return () => {
      socket.off('dataChanged');
    };
  }, [selectedTable]);

  const refreshData = async () => {
    try {
      const response = await axios.get(`${API_URL}/data/${selectedTable}`);
      const newData = response.data;
      setData(newData);
      if (newData.length > 0) {
        setHeaders(Object.keys(newData[0]));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Erro ao carregar dados', 'error');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('table', selectedTable);

    try {
      await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setOpenUpload(false);
      showNotification('Arquivo importado com sucesso', 'success');
      refreshData();
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification('Erro ao importar arquivo', 'error');
    }
  }, [selectedTable]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
  });

  const handleExport = async (format: 'xlsx' | 'csv' | 'json') => {
    try {
      const response = await axios.get(`${API_URL}/export/${selectedTable}/${format}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedTable}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showNotification('Arquivo exportado com sucesso', 'success');
    } catch (error) {
      console.error('Error exporting file:', error);
      showNotification('Erro ao exportar arquivo', 'error');
    }
  };

  const handleEditSave = async () => {
    if (!editRow) return;

    try {
      await axios.put(`${API_URL}/data/${selectedTable}/${editRow.id}`, editRow);
      setEditRow(null);
      refreshData();
      showNotification('Registro atualizado com sucesso', 'success');
    } catch (error) {
      console.error('Error updating record:', error);
      showNotification('Erro ao atualizar registro', 'error');
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await axios.delete(`${API_URL}/data/${selectedTable}/${id}`);
      refreshData();
      showNotification('Registro excluído com sucesso', 'success');
    } catch (error) {
      console.error('Error deleting record:', error);
      showNotification('Erro ao excluir registro', 'error');
    }
  };

  const showNotification = (message: string, type: 'error' | 'info' | 'success') => {
    setNotification({ open: true, message, type });
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Gerenciador de Dados</Typography>
          <Box>
            <Button
              startIcon={<UploadIcon />}
              onClick={() => setOpenUpload(true)}
              sx={{ mr: 1 }}
            >
              Importar
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('xlsx')}
              sx={{ mr: 1 }}
            >
              Exportar Excel
            </Button>
            <Button
              startIcon={<RefreshIcon />}
              onClick={refreshData}
            >
              Atualizar
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableCell key={header}>{header}</TableCell>
                ))}
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  {headers.map((header) => (
                    <TableCell key={`${row.id}-${header}`}>{row[header]}</TableCell>
                  ))}
                  <TableCell>
                    <IconButton onClick={() => setEditRow(row)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(row.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)}>
        <DialogTitle>Importar Arquivo</DialogTitle>
        <DialogContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <Typography>Solte o arquivo aqui...</Typography>
            ) : (
              <Typography>
                Arraste e solte um arquivo aqui, ou clique para selecionar
              </Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editRow} onClose={() => setEditRow(null)}>
        <DialogTitle>Editar Registro</DialogTitle>
        <DialogContent>
          {editRow && headers.map((header) => (
            <TextField
              key={header}
              label={header}
              value={editRow[header] || ''}
              onChange={(e) => setEditRow({ ...editRow, [header]: e.target.value })}
              fullWidth
              margin="normal"
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRow(null)}>Cancelar</Button>
          <Button onClick={handleEditSave}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataManager;
