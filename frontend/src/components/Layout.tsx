import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import veritasLogo from '../assets/veritas-logo.jfif';

export const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper to determine if a nav link is active
    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const navLinkClass = (path: string) =>
        `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${isActive(path)
            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
            : 'text-gray-500 hover:text-secondary hover:bg-gray-100/50'
        }`;

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-accent/5 blur-[100px]"></div>
            </div>

            {/* Enhanced Navigation Bar */}
            <nav className="glass-panel sticky top-0 z-50 border-b border-white/20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between">
                        {/* Logo & Brand Section */}
                        <div className="flex items-center gap-6">
                            {/* University Logo */}
                            <Link to="/" className="flex items-center gap-3 group transition-all hover:scale-105">
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                    <img src={veritasLogo} alt="Veritas University Logo" className="relative h-12 w-12 object-contain" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-2xl font-black tracking-tighter text-secondary flex items-baseline">
                                        V-CTRIP
                                    </h1>
                                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">Intelligence Platform</p>
                                </div>
                            </Link>

                            {/* Navigation Links */}
                            <div className="ml-8 hidden lg:flex items-center space-x-1">
                                <Link to="/" className={navLinkClass('/')}>
                                    Dashboard
                                </Link>
                                <Link to="/intelligence" className={navLinkClass('/intelligence')}>
                                    Intelligence
                                </Link>
                                <Link to="/my-reports" className={navLinkClass('/my-reports')}>
                                    My Reports
                                </Link>

                                {user?.role === 'STUDENT' && (
                                    <Link to="/submit-report" className={navLinkClass('/submit-report')}>
                                        Submit Report
                                    </Link>
                                )}

                                {(user?.role === 'ADMIN' || user?.role === 'SECURITY' || user?.role === 'STAFF') && (
                                    <>
                                        <Link to="/analyst" className={navLinkClass('/analyst')}>
                                            Analyst View
                                        </Link>
                                        <Link to="/analytics" className={navLinkClass('/analytics')}>
                                            Analytics
                                        </Link>
                                    </>
                                )}

                                {user?.role === 'ADMIN' && (
                                    <Link to="/admin" className={navLinkClass('/admin')}>
                                        Admin
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* User Info & Logout */}
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block mr-2">
                                <span className="text-sm font-semibold text-secondary block leading-none">{user?.email?.split('@')[0]}</span>
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">
                                    {user?.role}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="border-primary/20 hover:bg-primary/5 font-bold uppercase tracking-tight text-xs transition-all duration-300"
                            >
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 relative z-10 flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-100 py-6 mt-auto relative z-10">
                <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 gap-4">
                    <p className="font-medium">© 2026 Veritas University Abuja - V-CTRIP</p>
                    <div className="flex gap-6 items-center">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            System Operational
                        </span>
                        <p className="font-bold text-gray-400">ICT CENTRE</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
