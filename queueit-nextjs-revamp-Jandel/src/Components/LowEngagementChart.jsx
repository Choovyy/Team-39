import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LowEngagementChart = ({ data }) => {
    const chartData = {
        labels: data.map(team => team.teamName), 
        datasets: [
            {
                label: "Meeting Count", 
                data: data.map(team => team.meetingCount), // Access meetingCount
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                barThickness: 25,
            }
        ]
    };

    const options = {
        indexAxis: "y", // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true, // Start the x-axis at zero
            }
        }
    };

    return <Bar data={chartData} options={options} />;
};

export default LowEngagementChart;