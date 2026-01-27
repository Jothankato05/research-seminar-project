import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ShieldAlert, X } from 'lucide-react';

const SOCKET_URL = 'http://localhost:3000'; // Adjust if backend URL differs

interface Notification {
    id: string;
    title: string;
    priority: string;
    message: string;
}

export const NotificationToast = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socket.on('critical-report', (data: Notification) => {
            setNotifications((prev) => [...prev, data]);

            // Auto-dismiss after 10 seconds
            setTimeout(() => {
                setNotifications((prev) => prev.filter(n => n.id !== data.id));
            }, 10000);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter(n => n.id !== id));
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-4">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className="bg-red-50 border-l-4 border-red-500 p-4 shadow-lg rounded-r-lg max-w-sm animate-slide-in"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-start">
                            <ShieldAlert className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
                            <div>
                                <h3 className="text-red-800 font-bold text-sm">CRITICAL ALERT</h3>
                                <p className="text-red-700 text-sm mt-1">{notif.message}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => removeNotification(notif.id)}
                            className="text-red-400 hover:text-red-600 transition"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
