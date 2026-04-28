import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error('All fields required');

        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back 🚀');
            navigate('/');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-2xl"
            >
                <h1 className="text-3xl font-bold text-white text-center mb-6">
                    AI CRM Login
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <div className="relative">
                        <input
                            type={show ? 'text' : 'password'}
                            placeholder="Password"
                            className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/20"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShow(!show)}
                            className="absolute right-3 top-3 text-white"
                        >
                            {show ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                    </div>

                    <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-lg text-white font-semibold flex justify-center">
                        {loading ? <Loader2 className="animate-spin"/> : 'Login'}
                    </button>
                </form>

                <p className="text-center text-gray-300 mt-4">
                    No account? <Link to="/register" className="text-purple-400">Register</Link>
                </p>
            </motion.div>
        </div>
    );
}