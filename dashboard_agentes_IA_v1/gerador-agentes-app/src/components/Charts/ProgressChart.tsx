import React from 'react';
import { Line } from 'react-chartjs-2';

interface ProgressChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      tension: number;
    }[];
  };
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Progresso Semanal</h3>
      <div className="relative" style={{ height: "300px" }}>
        <Line 
          data={data} 
          options={{ 
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }} 
        />
      </div>
    </div>
  );
};

export default ProgressChart;
