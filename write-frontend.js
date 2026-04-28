const fs = require('fs');
const path = require('path');
const base = 'c:/Users/Rupesh kumar sah/OneDrive/Desktop/rupesh3/frontend/src';

function writeFile(file, content) {
    const fullPath = path.join(base, file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
    console.log('Wrote:', file);
}

const sidebar = `import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { LayoutDashboard, Users, KanbanSquare, ListTodo, LogOut, ChevronLeft, ChevronRight, Sun, Moon, Zap } from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Leads', href: '/leads', icon: Users },
    { name: 'Pipeline', href: '/pipeline', icon: KanbanSquare },
    { name: 'Activities', href: '/activities', icon: ListTodo },
];

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const { isDark, toggle } = useThemeStore();

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 72 : 256 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
        >
            <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white shrink-0">
                        <Zap className="h-5 w-5" />
                    </div>
                    {!collapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-slate-900 dark:text-white text-lg whitespace-nowrap">
                            AI CRM
                        </motion.span>
                    )}
                </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link key={item.name} to={item.href}
                            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                isActive ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200')}
                        >
                            <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-violet-600 dark:text-violet-400')} />
                            {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
                            {isActive && !collapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-600" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                <button onClick={toggle}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                {user && (
                    <>
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{user.name[0]?.toUpperCase()}</span>
                            </div>
                            {!collapsed && (
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                </div>
                            )}
                        </div>
                        <button onClick={logout}
                            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                            <LogOut className="h-5 w-5" />
                            {!collapsed && <span>Logout</span>}
                        </button>
                    </>
                )}

                <button onClick={onToggle}
                    className="flex w-full items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>
        </motion.aside>
    );
}`;

const layout = `import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="shrink-0 h-full z-20">
                <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            </div>
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="min-h-full p-6 lg:p-8 max-w-[1600px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}`;

const main = `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { useThemeStore } from './stores/themeStore';

const theme = useThemeStore.getState();
if (theme.isDark) document.documentElement.classList.add('dark');

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <App />
                <Toaster position="top-right" toastOptions={{
                    className: 'dark:bg-slate-800 dark:text-white dark:border-slate-700',
                    duration: 4000,
                }} />
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>
);`;

const app = `import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Pipeline from './pages/Pipeline';
import Activities from './pages/Activities';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="leads" element={<Leads />} />
                <Route path="pipeline" element={<Pipeline />} />
                <Route path="activities" element={<Activities />} />
            </Route>
        </Routes>
    );
}`;

writeFile('components/layout/Sidebar.tsx', sidebar);
writeFile('components/layout/Layout.tsx', layout);
writeFile('main.tsx', main);
writeFile('App.tsx', app);
console.log('Done writing core files.');
