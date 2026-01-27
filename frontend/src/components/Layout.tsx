
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
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(path)
            ? 'bg-white/20 text-white'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Enhanced Navigation Bar */}
            <nav className="bg-gradient-to-r from-primary to-green-900 text-white shadow-lg">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo & Brand Section */}
                        <div className="flex items-center gap-4">
                            {/* University Logo */}
                            <div className="flex items-center gap-3">
                                <img src={veritasLogo} alt="Veritas University Logo" className="h-10 w-10 rounded-lg object-contain bg-white/10 p-1" />
                                <div className="hidden sm:block">
                                    <Link to="/" className="text-xl font-bold tracking-tight text-white">
                                        V-CTRIP
                                    </Link>
                                    <p className="text-xs text-green-100 italic">"Seeking the Truth"</p>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <div className="ml-8 flex items-center space-x-1">
                                <Link to="/" className={navLinkClass('/')}>
                                    Dashboard
                                </Link>
                                <Link to="/intelligence" className={navLinkClass('/intelligence')}>
                                    Intelligence
                                </Link>

                                {/* My Reports - Available to all authenticated users */}
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
                            <div className="text-right hidden sm:block">
                                <span className="text-sm text-white">{user?.email}</span>
                                <p className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase()}</p>
                            </div>
                            <Button variant="secondary" size="sm" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 border-t border-gray-200 py-4 mt-auto">
                <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
                    <p>© 2026 Veritas University Abuja - V-CTRIP | ICT Centre</p>
                </div>
            </footer>
        </div>
    );
};
