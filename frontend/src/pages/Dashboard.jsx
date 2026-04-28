import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { Users, DollarSign, TrendingUp, Target } from 'lucide-react';

export default function Dashboard() {

    const { data } = useQuery({
        queryKey: ['analytics'],
        queryFn: async () => {
            const res = await api.get('/analytics/dashboard');
            return res.data.data;
        }
    });

    const cards = [
        { title: 'Leads', value: data?.totalLeads, icon: Users },
        { title: 'Revenue', value: '$' + data?.totalRevenue, icon: DollarSign },
        { title: 'Conversion', value: data?.conversionRate + '%', icon: TrendingUp },
        { title: 'Win Rate', value: data?.winRate + '%', icon: Target }
    ];

    return (
        <div className="min-h-screen bg-slate-950 p-6 text-white">

            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-4 gap-6">

                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="p-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg"
                    >
                        <card.icon className="mb-2"/>
                        <p className="text-gray-400">{card.title}</p>
                        <h2 className="text-2xl font-bold">{card.value}</h2>
                    </motion.div>
                ))}

            </div>

        </div>
    );
}