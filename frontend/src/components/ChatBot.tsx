import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, User, MessageSquare, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ChatMessage {
    role: 'user' | 'bot';
    content: string;
}

export const ChatBot = () => {
    const { token, user } = useAuth();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const submit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        const userQuery = query;
        setQuery('');
        setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
        setLoading(true);

        try {
            const res = await axios.post(
                '/chat',
                { query: userQuery },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setMessages(prev => [...prev, { role: 'bot', content: res.data.answer }]);
        } catch (e: any) {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: e.response?.data?.message || 'Sorry, I encountered an error processing your request. Please check your connection or try logging in again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col h-[600px]">
            <div className="bg-primary text-primary-foreground p-4 bg-gray-800 text-white">
                <h2 className="text-xl font-bold flex items-center">
                    <ShieldAlert className="w-6 h-6 mr-2" /> V-CTRIP Intelligence Assistant
                </h2>
                <p className="text-sm opacity-80">
                    {user?.role === 'ADMIN' || user?.role === 'SECURITY'
                        ? 'Full Access Mode (Detailed Mitigation & Analysis)'
                        : 'Standard Access Mode (Sanitized Responses Only)'}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        <Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="font-medium">How can I help you analyze threats today?</p>
                        <p className="text-sm mt-2">Try asking:</p>
                        <ul className="text-sm mt-2 space-y-1">
                            <li className="bg-gray-200 inline-block px-2 py-1 rounded cursor-pointer hover:bg-gray-300 transition"
                                onClick={() => setQuery("What were the top phishing threats last week?")}>
                                "What were the top phishing threats last week?"
                            </li>
                            <br />
                            <li className="bg-gray-200 inline-block px-2 py-1 rounded cursor-pointer hover:bg-gray-300 transition mt-1"
                                onClick={() => setQuery("Summarize the most critical open reports.")}>
                                "Summarize the most critical open reports."
                            </li>
                        </ul>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                            }`}>
                            <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-lg p-3 rounded-bl-none shadow-sm">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={submit} className="flex gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask about threats, reports, or mitigation strategies..."
                        disabled={loading}
                        className="flex-1"
                    />
                    <Button type="submit" isLoading={loading} disabled={!query.trim() || loading}>
                        Send
                    </Button>
                </form>
            </div>
        </div>
    );
};
