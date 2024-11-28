'use client';

import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navigation from '../../components/Navigation';
import StatusMetrics from '../../components/StatusMetrics';
import Charts from '../../components/Charts';
import Tables from '../../components/Tables';
import Gauge from '../../components/Gauge';
import Chatbot from '../../components/Chatbot';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff0000',
    },
    background: {
      default: '#000000',
      paper: '#1a1a1a',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default function DashboardPage() {
  const sampleData = {
    maintenance: [
      { date: "2024-01", value: 150, ships: 10, cost: 50000 },
      { date: "2024-02", value: 180, ships: 15, cost: 75000 },
      { date: "2024-03", value: 120, ships: 8, cost: 40000 },
      { date: "2024-04", value: 200, ships: 20, cost: 100000 },
    ],
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="min-h-screen">
        <Navigation />
        <div className="p-6">
          <Gauge />
          <StatusMetrics />
          <Tables sampleData={sampleData} />
          <Charts sampleData={sampleData} />
        </div>
        <Chatbot />
      </div>
    </ThemeProvider>
  );
}
