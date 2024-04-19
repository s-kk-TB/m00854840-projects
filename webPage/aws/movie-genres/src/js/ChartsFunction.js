import { Chart as ChartJs } from "chart.js/auto";
import { Line, Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJs.register(ChartDataLabels);

/* Numeric chart */
export function createChart(genreName,graphLabels,graphData){
    return (
        <Line
            options={{
                plugins: {
                    datalabels: {
                        display: false
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }}
            data={{
                labels: graphLabels,
                datasets:[{
                    label: genreName,
                    data: graphData,
                    borderColor: "#F2380F",
                    borderWidth: 1,
                    tension: 0.1,
                    pointStyle: 'rectRot',
                    pointRadius: 4
                }]
            }}
        />
    );
}

/* Synthetic/Predictions chart */
export function createMultiLine(graphLabels,graphDatasets){
    return(
        <Line
            options={{
                plugins: {
                    datalabels: {
                        display: false
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }}
            data={{
                labels: graphLabels,
                datasets: graphDatasets
            }}   
        />
    )
}

/* Sentiment graph */
export function createSentGraph(neg,pos){
    return (
        <Bar
            options={{
                responsive: true,
                scales: {
                    x: {
                        display: false,
                        stacked: true,
                    },
                    y: {
                        display: false,
                        min: 0,
                        max: 100,
                        stacked: true,
                    },
                },
                plugins: {
                    datalabels: {
                        align: 'center',
                        anchor: 'end',
                        font: {
                            size: 10,
                            weight: 'bold'
                        },
                        color: '#D8D9C5',
                        formatter: function(value, context) {
                            return Math.round(value) + '%';
                        }
                    }
                }
            }}
            data={{
                labels: "-",
                datasets: [
                    {
                        label: "Negative",
                        data: [neg],
                        backgroundColor: "rgba(255, 0, 0, 0)",
                        borderColor: "rgba(255, 0, 0, 1)",
                        borderWidth: 1,
                        barThickness: 2,
                        pointStyle: 'rectRot',
                        pointRadius: 4
                    },
                    {
                        label: "Positive",
                        data: [pos],
                        backgroundColor: "rgba(0, 255, 0, 0)",
                        borderColor: "rgba(0, 255, 0, 1)",
                        borderWidth: 1,
                        barThickness: 2,
                        pointStyle: 'rectRot',
                        pointRadius: 4
                    },
                ],
            }}
        />
    )
}