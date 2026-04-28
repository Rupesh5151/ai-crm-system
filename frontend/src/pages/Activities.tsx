import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Phone, Mail, Calendar, StickyNote, CheckCircle, Loader2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import EmptyState from '../components/common/EmptyState';
import { api } from '../services/api';
import { Activity, ActivityType } from '../types';

const typeIcons: Record<ActivityType, any> = { call:Phone, email:Mail, meeting:Calendar, note:StickyNote, task:CheckCircle, status_change:CheckCircle };
const typeColors: Record<ActivityType, string> = { call:'text-blue-600 bg-blue-50', email:'text-violet-600 bg-violet-50', meeting:'text-amber-600 bg-amber-50', note:'text-slate-600 bg-slate-50', task:'text-emerald-600 bg-emerald-50', status_change:'text-orange-600 bg-orange-50' };

export default function Activities() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => { const res = await api.get('/activities'); return res.data.data ?? []; }
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
      <PageHeader title="Activities" subtitle="Track all interactions with your leads"/>
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600"/></div>
      ) : !activities || activities.length === 0 ? (
        <EmptyState title="No activities yet" description="Activities will appear here when you log calls, emails, or meetings."/>
      ) : (
        <div className="space-y-3">
          {activities.map((activity: Activity)=>(
            <Card key={activity._id} className="p-4">
              <div className="flex items-start gap-4">
                <div className={'h-10 w-10 rounded-lg flex items-center justify-center shrink-0 '+(typeColors[activity.type] || 'text-slate-600 bg-slate-50')}
                  style={{backgroundColor:'transparent'}}>
                  {(()=>{ const Icon = typeIcons[activity.type] || StickyNote; return <Icon className="h-5 w-5"/>; })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{activity.title}</h3>
                    <span className="text-xs text-slate-400">{formatDate(activity.createdAt)}</span>
                  </div>
                  {activity.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{activity.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">{activity.type.replace('_',' ')}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
