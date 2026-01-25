import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export const AnalyticsDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('analytics');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch analytics', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) return <div>Loading...</div>;
    if (!stats) return <div>No data available</div>;

    const typeData = {
        labels: stats.reportsByType.map((item: any) => item.type),
        datasets: [
            {
                label: 'Reports by Type',
                data: stats.reportsByType.map((item: any) => item.count),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    const priorityData = {
        labels: stats.reportsByPriority.map((item: any) => item.priority),
        datasets: [
            {
                label: '# of Reports',
                data: stats.reportsByPriority.map((item: any) => item.count),
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Threat Types</h2>
                    <Bar options={{ responsive: true }} data={typeData} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Severity Distribution</h2>
                    <div className="w-2/3 mx-auto">
                        <Pie data={priorityData} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Total Reports</p>
                        <p className="text-2xl font-bold text-primary">{stats.totalReports}</p>
                    </div>
                    {stats.reportsByStatus.map((item: any) => (
                        <div key={item.status} className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-sm text-gray-500">{item.status}</p>
                            <p className="text-2xl font-bold text-gray-800">{item.count}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
