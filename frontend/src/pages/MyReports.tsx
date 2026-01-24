import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Report {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    type: string;
}

export const MyReports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                // Fetch only reports submitted by the current user
                const response = await axios.get('/reports/my?limit=100');
                setReports(response.data.data);
            } catch (error) {
                console.error('Failed to fetch reports', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-800';
            case 'INVESTIGATING': return 'bg-yellow-100 text-yellow-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            case 'DISMISSED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Reports</h1>
                <Link to="/submit-report" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                    New Report
                </Link>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200">
                        {reports.map((report) => (
                            <li key={report.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-primary truncate">{report.title}</p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                                                {report.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                {report.type}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <p>
                                                Submitted on {new Date(report.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {reports.length === 0 && (
                            <li className="px-4 py-8 text-center text-gray-500">
                                No reports found.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
