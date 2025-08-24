import { ScatterChartData } from '@/Utils/Global_variables';
import React from 'react'
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

interface ScatterChartProps{
    dataset: ScatterChartData
    chartTitle:string
}

const ScatterChart:React.FC<ScatterChartProps> = ({dataset, chartTitle}) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: chartTitle,
          },
        },
        scales: {
          x: {
            type: "linear",
            position: "bottom",
            beginAtZero: true,
            title:{
                display:true,
                text:'Number of Meetings'
            }
          },
          y: {
            min:0,
            max:5,
            beginAtZero: true,
            title:{
                display:true,
                text:'Team Grade Average'
            }
          },
        },
      };
    return (
        <Scatter data={dataset} options={options}/>
    )
}

export default ScatterChart
