import { useState } from 'react';
import axios from 'axios';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PanicButton = () => {
    const { isAuthenticated, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [triggered, setTriggered] = useState(false);

    if (!isAuthenticated) return null;

    const triggerPanic = async () => {
        if (!window.confirm("⚠️ CONFIRM EMERGENCY\n\nThis will immediately alert Campus Security and IT Administrators of a critical threat at your location.\n\nAre you sure?")) {
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                '/reports',
                {
                    title: '🚨 PANIC BUTTON TRIGGERED',
                    description: 'User initiated emergency panic alert. Immediate assistance required.',
                    type: 'OTHER',
                    priority: 'CRITICAL',
                    isAnonymous: false
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTriggered(true);
            setTimeout(() => setTriggered(false), 5000);
        } catch (err) {
            console.error(err);
            alert("Failed to send panic alert. Call 0800-VERITAS-SEC immediately.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={triggerPanic}
            disabled={loading || triggered}
            className={`fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-2xl transition-all duration-300 ${triggered
                ? 'bg-green-600 scale-110'
                : 'bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 animate-pulse'
                }`}
            title="Emergency Panic Button"
        >
            {loading ? (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
            ) : triggered ? (
                <span className="text-white font-bold text-sm">SENT</span>
            ) : (
                <AlertTriangle className="h-8 w-8 text-white" />
            )}
        </button>
    );
};
