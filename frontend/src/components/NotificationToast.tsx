import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ShieldAlert, X, Zap } from 'lucide-react';

// Socket URL derived from API URL
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1/', '') || 'http://localhost:3000';

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
            console.log('📡 Intelligence Stream Connected');
        });

        socket.on('critical-report', (data: Notification) => {
            setNotifications((prev) => [...prev, data]);

            // Audio alert (optional, usually requires user interaction)
            // new Audio('/alert.mp3').play().catch(() => {});

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
        <div className="fixed top-24 right-6 z-[100] space-y-4 pointer-events-none">
            {notifications.map((notif, idx) => (
                <div
                    key={`${notif.id}-${idx}`}
                    className="pointer-events-auto group relative w-96 glass-panel rounded-2xl p-0 overflow-hidden shadow-2xl animate-in border-l-4 border-red-500 bg-white/95"
                >
                    <div className="p-5 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                            <ShieldAlert className="w-6 h-6 text-red-600" />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black text-red-600 flex items-center gap-1 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                                    <Zap className="w-3 h-3 fill-current" /> High Urgency
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-auto">
                                    Just Now
                                </span>
                            </div>
                            <h3 className="text-secondary font-black text-sm tracking-tight mb-1 group-hover:text-red-600 transition-colors">
                                {notif.title}
                            </h3>
                            <p className="text-gray-500 text-[11px] font-medium leading-relaxed">
                                {notif.message}
                            </p>
                        </div>

                        <button
                            onClick={() => removeNotification(notif.id)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-secondary hover:bg-gray-100 transition-all active:scale-90"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Progress bar timer */}
                    <div className="absolute bottom-0 left-0 h-1 bg-red-500/20 w-full">
                        <div
                            className="h-full bg-red-500 transition-all duration-[10000ms] ease-linear"
                            style={{ width: '0%', animation: 'shrinkWidth 10s linear forwards' }}
                        ></div>
                    </div>
                </div>
            ))}

            <style>{`
                @keyframes shrinkWidth {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};
