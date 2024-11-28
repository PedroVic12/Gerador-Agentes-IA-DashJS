'use client';

import React, { useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Button,
  Typography,
  SelectChangeEvent
} from '@mui/material';
import Papa from 'papaparse';

interface DynamicChartProps {
  initialData?: any;
}

const DynamicChart: React.FC<DynamicChartProps> = ({ initialData }) => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedX, setSelectedX] = useState<string>('');
  const [selectedY, setSelectedY] = useState<string>('');
  const [chartType, setChartType] = useState<'scatter' | 'bar' | 'line'>('scatter');

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const parsedData = results.data as any[];
          if (parsedData.length > 0) {
            setHeaders(Object.keys(parsedData[0]));
            setCsvData(parsedData);
          }
        },
        header: true,
        dynamicTyping: true,
      });
    }
  }, []);

  const handleXChange = (event: SelectChangeEvent<string>) => {
    setSelectedX(event.target.value);
  };

  const handleYChange = (event: SelectChangeEvent<string>) => {
    setSelectedY(event.target.value);
  };

  const handleChartTypeChange = (event: SelectChangeEvent<'scatter' | 'bar' | 'line'>) => {
    setChartType(event.target.value as 'scatter' | 'bar' | 'line');
  };

  const getPlotData = () => {
    if (!selectedX || !selectedY || csvData.length === 0) return [];

    const xValues = csvData.map(row => row[selectedX]);
    const yValues = csvData.map(row => row[selectedY]);

    return [{
      x: xValues,
      y: yValues,
      type: chartType,
      mode: chartType === 'scatter' ? 'markers' : undefined,
      marker: { color: '#ff0000' },
    }];
  };

  return (
    <Paper sx={{ p: 3, m: 2, backgroundColor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        Gráfico Dinâmico
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          component="label"
          sx={{ mr: 2 }}
        >
          Carregar CSV
          <input
            type="file"
            hidden
            accept=".csv"
            onChange={handleFileUpload}
          />
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Eixo X</InputLabel>
          <Select
            value={selectedX}
            label="Eixo X"
            onChange={handleXChange}
          >
            {headers.map((header) => (
              <MenuItem key={header} value={header}>
                {header}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Eixo Y</InputLabel>
          <Select
            value={selectedY}
            label="Eixo Y"
            onChange={handleYChange}
          >
            {headers.map((header) => (
              <MenuItem key={header} value={header}>
                {header}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Tipo de Gráfico</InputLabel>
          <Select
            value={chartType}
            label="Tipo de Gráfico"
            onChange={handleChartTypeChange}
          >
            <MenuItem value="scatter">Dispersão</MenuItem>
            <MenuItem value="bar">Barras</MenuItem>
            <MenuItem value="line">Linha</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {selectedX && selectedY && csvData.length > 0 && (
        <Plot
          data={getPlotData()}
          layout={{
            width: 800,
            height: 500,
            title: `${selectedY} vs ${selectedX}`,
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: '#ffffff' },
            xaxis: {
              title: selectedX,
              gridcolor: '#444444',
              zerolinecolor: '#666666',
            },
            yaxis: {
              title: selectedY,
              gridcolor: '#444444',
              zerolinecolor: '#666666',
            },
          }}
          config={{ responsive: true }}
        />
      )}
    </Paper>
  );
};

export default DynamicChart;
