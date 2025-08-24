'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

interface DataEntry{
  data: Array<number>
  backgroundColor: Array<string>
}


interface HistogramData{
  labels: Array<string>
  datasets: Array<DataEntry>
}

interface HistogramChartProps{
  data:HistogramData
}

const HistogramChart:React.FC<HistogramChartProps> = ({data}) => {
  // const data = {
  //   labels: ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70'],
  //   datasets: [
  //     {
  //       label: 'Frequency',
  //       data: [5, 9, 15, 10, 7, 3, 1],
  //       backgroundColor: 'rgba(75, 192, 192, 0.5)',
  //       borderColor: 'rgba(75, 192, 192, 1)',
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  const options = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default HistogramChart;
