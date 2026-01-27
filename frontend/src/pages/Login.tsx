import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import axios from 'axios';
import { motion } from 'framer-motion';
import veritasLogo from '../assets/veritas-logo.jfif';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('auth/login', { email, password });
            const { access_token, refresh_token, user } = response.data;
            login(access_token, refresh_token, user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 bg-[url('/vctrip-banner.png')] bg-cover bg-center bg-no-repeat">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-8 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 relative z-10"
            >
                <div className="text-center">
                    <img
                        src={veritasLogo}
                        alt="Veritas University"
                        className="mx-auto h-24 w-auto mb-4"
                    />
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                        V-CTRIP
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Veritas Cyber Threat Reporting & Intelligence Platform
                    </p>
                    <h3 className="mt-6 text-xl font-bold text-gray-800">
                        Sign in to your account
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Or{' '}
                        <Link to="/register" className="font-medium text-primary hover:text-primary-dark transition-colors">
                            create a new account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div className="mb-4">
                            <Input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Sign in
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
