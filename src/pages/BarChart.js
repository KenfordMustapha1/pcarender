// BarChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';

// Import required components for Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ data }) => {
  // Configuration options for the chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide the x-axis grid lines
        },
      },
      y: {
        beginAtZero: true, // Start y-axis from 0
        ticks: {
          stepSize: 100, // Adjust the step size of ticks
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default BarChart;
