import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) return toast.error('All fields required');

        try {
            await register(name, email, password);
            toast.success('Account created 🚀');
            navigate('/');
        } catch (err) {
            toast.error('Failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-2xl"
            >
                <h1 className="text-3xl text-white text-center mb-6 font-bold">
                    Create Account
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        placeholder="Name"
                        className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/20"
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        placeholder="Email"
                        className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/20"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/20"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-lg text-white font-semibold">
                        Register
                    </button>
                </form>

                <p className="text-center text-gray-300 mt-4">
                    Already have account? <Link to="/login" className="text-purple-400">Login</Link>
                </p>
            </motion.div>
        </div>
    );
}