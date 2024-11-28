import { useEffect, useState } from 'react';

interface ChartProps {
  sampleData: {
    maintenance: {
      date: string;
      value: number;
      ships: number;
      cost: number;
    }[];
  };
}

export default function Charts({ sampleData }: ChartProps) {
  const [selectedGraphData, setSelectedGraphData] = useState({
    x: "date",
    y: "value",
  });
  const [graphType, setGraphType] = useState("line");
  const [plotlyLoaded, setPlotlyLoaded] = useState(false);

  const plotData = {
    x: sampleData.maintenance.map((item) => item[selectedGraphData.x as keyof typeof item]),
    y: sampleData.maintenance.map((item) => item[selectedGraphData.y as keyof typeof item]),
    type: graphType,
  };

  useEffect(() => {
    const loadPlotly = async () => {
      try {
        const script = document.createElement("script");
        script.src = "https://cdn.plot.ly/plotly-2.24.1.min.js";
        script.async = true;
        script.onload = () => setPlotlyLoaded(true);
        document.body.appendChild(script);
      } catch (err) {
        console.error("Error loading Plotly:", err);
      }
    };
    loadPlotly();
  }, []);

  useEffect(() => {
    if (plotlyLoaded && window.Plotly) {
      const config = {
        title: "Maintenance Analysis",
        paper_bgcolor: "#1a1a1a",
        plot_bgcolor: "#1a1a1a",
        font: { color: "#ffffff" },
      };

      if (document.getElementById("lineChart")) {
        window.Plotly.newPlot("lineChart", [plotData], config);
      }

      if (document.getElementById("barChart")) {
        window.Plotly.newPlot("barChart", [{ ...plotData, type: "bar" }], {
          ...config,
          title: "Cost Analysis",
        });
      }

      if (document.getElementById("pieChart")) {
        window.Plotly.newPlot(
          "pieChart",
          [
            {
              labels: plotData.x,
              values: plotData.y,
              type: "pie",
            },
          ],
          {
            ...config,
            title: "Distribution",
          }
        );
      }
    }
  }, [selectedGraphData, graphType, plotlyLoaded, plotData]);

  return (
    <div className="mb-6 bg-[#1a1a1a] rounded p-6 text-white">
      <div className="flex gap-4 mb-4">
        <select
          className="bg-[#333] border-none p-2 rounded text-white"
          onChange={(e) =>
            setSelectedGraphData((prev) => ({ ...prev, x: e.target.value }))
          }
        >
          <option value="date">Date</option>
          <option value="ships">Ships</option>
          <option value="cost">Cost</option>
        </select>
        <select
          className="bg-[#333] border-none p-2 rounded text-white"
          onChange={(e) =>
            setSelectedGraphData((prev) => ({ ...prev, y: e.target.value }))
          }
        >
          <option value="value">Value</option>
          <option value="ships">Ships</option>
          <option value="cost">Cost</option>
        </select>
        <select
          className="bg-[#333] border-none p-2 rounded text-white"
          onChange={(e) => setGraphType(e.target.value)}
        >
          <option value="line">Line</option>
          <option value="bar">Bar</option>
          <option value="pie">Pie</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div id="lineChart" className="w-full h-[300px]"></div>
        <div id="barChart" className="w-full h-[300px]"></div>
        <div id="pieChart" className="w-full h-[300px]"></div>
      </div>
    </div>
  );
}
