import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, User, MessageSquare, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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
        <div className="glass-panel rounded-3xl overflow-hidden flex flex-col h-[650px] shadow-2xl relative border-white/40">
            {/* Header */}
            <div className="premium-gradient p-6 text-white relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldAlert className="w-24 h-24 rotate-12" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black flex items-center tracking-tight">
                            Intelligence <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-lg text-sm font-bold uppercase tracking-widest">Assistant</span>
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                                {user?.role === 'ADMIN' || user?.role === 'SECURITY'
                                    ? 'Privileged Access Mode'
                                    : 'Standard Access Mode'}
                            </p>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Bot className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfcfd]">
                {messages.length === 0 && (
                    <div className="text-center py-10 animate-fade-in flex flex-col items-center">
                        <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6 border border-primary/10">
                            <MessageSquare className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-black text-secondary tracking-tight">How can I assist you today?</h3>
                        <p className="text-sm text-gray-500 mt-2 font-medium max-w-[250px]">Analyze threats, summarize reports, or get security guidance</p>

                        <div className="mt-8 grid grid-cols-1 gap-3 w-full max-w-sm">
                            <button
                                onClick={() => setQuery("What were the top phishing threats last week?")}
                                className="text-left p-4 rounded-2xl bg-white border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group shadow-sm"
                            >
                                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1 opacity-60">Insight Query</p>
                                <p className="text-sm text-gray-700 font-semibold group-hover:text-primary transition-colors">"What were the top phishing threats last week?"</p>
                            </button>
                            <button
                                onClick={() => setQuery("Summarize the most critical open reports.")}
                                className="text-left p-4 rounded-2xl bg-white border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group shadow-sm"
                            >
                                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1 opacity-60">Action Summary</p>
                                <p className="text-sm text-gray-700 font-semibold group-hover:text-primary transition-colors">"Summarize the most critical open reports."</p>
                            </button>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
                        <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border text-primary font-bold'
                                }`}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={`rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                ? 'bg-primary text-white rounded-tr-none'
                                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                }`}>
                                <div className="markdown-content text-[13px] leading-relaxed font-medium">
                                    <ReactMarkdown>{msg.content || ''}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start animate-in">
                        <div className="flex gap-3 max-w-[85%] items-center">
                            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-white border font-bold text-primary shadow-sm">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 rounded-tl-none shadow-sm h-12 flex items-center justify-center px-6">
                                <div className="flex space-x-1.5">
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
                <form onSubmit={submit} className="flex gap-3">
                    <div className="flex-1 relative group">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Type your security question..."
                            disabled={loading}
                            className="w-full pl-4 pr-12 py-3 rounded-xl border-gray-100 group-hover:border-primary/30 focus:border-primary transition-all duration-300 font-medium"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-primary/40 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        isLoading={loading}
                        disabled={!query.trim() || loading}
                        className="rounded-xl px-6 font-bold shadow-lg shadow-primary/10 transition-transform active:scale-95"
                    >
                        Send
                    </Button>
                </form>
            </div>
        </div>
    );
};
