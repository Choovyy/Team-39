'use client';

import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { RadarData } from '@/Utils/Global_variables';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Title, Tooltip, Legend);


interface RadarChartProps{
  data:RadarData
}

const RadarChart:React.FC<RadarChartProps> = ({data}) => {
  // const data = {
  //   labels: ['Speed', 'Strength', 'Agility', 'Endurance'],
  //   datasets: [
  //     {
  //       label: 'Team Performance',
  //       data: [8, 7, 9, 6],
  //       backgroundColor: 'rgba(54, 162, 235, 0.2)',
  //       borderColor: 'rgba(54, 162, 235, 1)',
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        min: 0, // Set minimum value to 0
        max: 5, // Set maximum value to 5
        ticks: {
          stepSize: 1, // Optional: Ensures steps of 1 unit
        },
      },
    },
  };
  

  return <Radar data={data} options={options} />;
};

export default RadarChart;
