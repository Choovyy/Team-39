import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { dpurple, lgreen } from '@/Utils/Global_variables';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LowPerformantStudentsChart = ({ data }) => {
    const chartData = {
        labels: data.map(student => `${student.lastName}`), // X-axis labels
        datasets: [
            {
                label: "Attendance Rate (%)",
                data: data.map(student => student.attendanceRate), // Y-axis data
                borderColor: "rgb(192, 163, 75)",
                backgroundColor: "rgb(248, 218, 129)",
                fill: true,
                tension: 0.1, // Smooth the line
            },
            {
                label: "Grade Average",
                data: data.map(student => student.gradeAverage), // Y-axis data
                borderColor: "rgb(255, 99, 143)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                fill: true,
                tension: 0.1, 
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
            },
            tooltip: {
                callbacks: {
                    title: (tooltipItems) => {
                        const index = tooltipItems[0].dataIndex;
                        const student = data[index];
                        return `${student.firstName} ${student.lastName}`; // Show full name on hover
                    },
                    label: (tooltipItem) => {
                        const datasetIndex = tooltipItem.datasetIndex;
                        const value = tooltipItem.raw;

                        // Check which dataset is being hovered
                        if (datasetIndex === 0) {
                            return `Attendance: ${value}%`; // Attendance dataset
                        } else if (datasetIndex === 1) {
                            return `Grade Average: ${value}`; // Grade average dataset
                        }
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                },
            },
            x: {
                title: {
                    display: true,
                },
            }
        }
    };

    return <Line data={chartData} options={options} />;
};

export default LowPerformantStudentsChart;