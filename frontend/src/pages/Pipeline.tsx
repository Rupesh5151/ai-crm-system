import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import ScoreBadge from '../components/common/ScoreBadge';
import EmptyState from '../components/common/EmptyState';
import { api } from '../services/api';
import { Lead, LeadStatus } from '../types';

const columns: LeadStatus[] = ['new','contacted','qualified','proposal','won'];
const columnLabels: Record<string,string> = { new:'New', contacted:'Contacted', qualified:'Qualified', proposal:'Proposal', won:'Won' };

export default function Pipeline() {
  const queryClient = useQueryClient();
  const [dragging, setDragging] = useState<string|null>(null);

  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => { const res = await api.get('/leads?limit=200'); return res.data.data.data ?? []; }
  });

  const updateStatus = useMutation({
    mutationFn: async ({id,status}:{id:string;status:string}) => { await api.patch('/leads/'+id, {status}); },
    onSuccess: () => { queryClient.invalidateQueries({queryKey:['leads']}); toast.success('Lead moved'); }
  });

  const leads: Lead[] = leadsData ?? [];

  const handleDragStart = (leadId: string) => setDragging(leadId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId && dragging) { updateStatus.mutate({id:leadId, status}); setDragging(null); }
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}>
      <PageHeader title="Pipeline" subtitle="Drag leads between stages to update their status"/>
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : leads.length === 0 ? (
        <EmptyState title="No leads yet" description="Add leads to see your pipeline."/>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col)=>(
            <div key={col} className="w-72 shrink-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{columnLabels[col]}</h3>
                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{leads.filter((l:Lead)=>l.status===col).length}</span>
              </div>
              <div onDragOver={handleDragOver} onDrop={(e)=>handleDrop(e,col)} className={'min-h-[200px] rounded-xl p-2 space-y-2 transition-colors '+(dragging?'bg-slate-100 dark:bg-slate-800/50':'bg-slate-50 dark:bg-slate-900/50')}>
                {leads.filter((l:Lead)=>l.status===col).map((lead:Lead)=>(
                  <div key={lead._id} draggable onDragStart={(e)=>{e.dataTransfer.setData('leadId',lead._id); handleDragStart(lead._id);}} onDragEnd={()=>setDragging(null)}
                    className={'bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow '+(dragging===lead._id?'opacity-50':'')}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{lead.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{lead.company}</p>
                      </div>
                      <GripVertical className="h-4 w-4 text-slate-300 shrink-0"/>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      {lead.score !== undefined ? <ScoreBadge lead={lead} size="sm" showLabel={false}/> : <span/>}
                      <span className="text-xs text-slate-400">${lead.estimatedValue ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
