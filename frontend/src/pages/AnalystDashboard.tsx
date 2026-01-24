import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/Button';

interface Report {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    type: string;
    createdAt: string;
    author: {
        email: string;
    } | null;
}

export const AnalystDashboard = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('OPEN');

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/reports?status=${filter}&limit=100`);
            setReports(response.data.data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await axios.patch(`/reports/${id}/status`, { status: newStatus });
            fetchReports(); // Refresh list
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Analyst Dashboard</h1>
                <div className="flex space-x-2">
                    {['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === status
                                ? 'bg-primary text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200">
                        {reports.map((report) => (
                            <li key={report.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-primary truncate">{report.title}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${report.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                        report.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-green-100 text-green-800'}`}>
                                                    {report.priority}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 line-clamp-2">{report.description}</p>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500 mr-4">
                                                    {report.type}
                                                </p>
                                                <p className="flex items-center text-sm text-gray-500">
                                                    {report.author ? report.author.email : 'Anonymous'}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex flex-col space-y-2">
                                        {report.status === 'OPEN' && (
                                            <Button size="sm" onClick={() => updateStatus(report.id, 'INVESTIGATING')}>
                                                Investigate
                                            </Button>
                                        )}
                                        {report.status === 'INVESTIGATING' && (
                                            <>
                                                <Button size="sm" onClick={() => updateStatus(report.id, 'RESOLVED')}>
                                                    Resolve
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => updateStatus(report.id, 'DISMISSED')}>
                                                    Dismiss
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                        {reports.length === 0 && (
                            <li className="px-4 py-8 text-center text-gray-500">
                                No reports found with status {filter}.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
