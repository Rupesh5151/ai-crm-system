const fs = require('fs');
const path = require('path');

const base = 'c:/Users/Rupesh kumar sah/OneDrive/Desktop/rupesh3/frontend/src';

function writeFile(file, content) {
    const fullPath = path.join(base, file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
    console.log('Wrote:', file);
}

//
// ==================== LOGIN ====================
//
const login = `import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">

            {/* LEFT SIDE */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-violet-600" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0')] bg-cover bg-center opacity-20" />
                
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="flex items-center gap-3 mb-8">
                        <Zap className="h-8 w-8" />
                        <span className="text-2xl font-bold">AI CRM</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Close more deals with AI</h1>
                    <p>Predict conversions, automate workflows.</p>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm">

                    <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} />
                        
                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9"
                            >
                                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>

                        <Button type="submit" className="w-full">
                            {loading ? <Loader2 className="animate-spin"/> : 'Login'}
                        </Button>
                    </form>

                    <p className="text-center mt-4">
                        No account? <Link to="/register">Register</Link>
                    </p>
                </div>
            </div>

        </div>
    );
}`;

//
// ==================== REGISTER ====================
//
const register = `import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            toast.error('All fields required');
            return;
        }

        try {
            await register(name, email, password);
            toast.success('Account created');
            navigate('/');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-sm">

                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
                    <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} />
                    <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

                    <Button type="submit" className="w-full">
                        Register
                    </Button>
                </form>

                <p className="text-center mt-4">
                    Already have account? <Link to="/login">Login</Link>
                </p>

            </div>
        </div>
    );
}`;

//
// ==================== DASHBOARD ====================
//
const dashboard = `import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export default function Dashboard() {

    const { data, isLoading } = useQuery({
        queryKey: ['analytics'],
        queryFn: async () => {
            const res = await api.get('/analytics/dashboard');
            return res.data.data;
        }
    });

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

            <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-white shadow rounded">
                    <p>Total Leads</p>
                    <h2>{data?.totalLeads}</h2>
                </div>

                <div className="p-4 bg-white shadow rounded">
                    <p>Revenue</p>
                    <h2>{data?.totalRevenue}</h2>
                </div>

                <div className="p-4 bg-white shadow rounded">
                    <p>Conversion</p>
                    <h2>{data?.conversionRate}%</h2>
                </div>

                <div className="p-4 bg-white shadow rounded">
                    <p>Win Rate</p>
                    <h2>{data?.winRate}%</h2>
                </div>
            </div>
        </div>
    );
}`;

//
// WRITE FILES
//
writeFile('pages/Login.jsx', login);
writeFile('pages/Register.jsx', register);
writeFile('pages/Dashboard.jsx', dashboard);

console.log('✅ All pages created successfully!');