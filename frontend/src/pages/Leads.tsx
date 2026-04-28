import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Loader2, Mail, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/common/StatusBadge';
import ScoreBadge from '../components/common/ScoreBadge';
import EmptyState from '../components/common/EmptyState';
import { api } from '../services/api';
import { Lead, LeadStatus } from '../types';

const statusOptions = [
  { value:'', label:'All Statuses' },
  { value:'new', label:'New' },
  { value:'contacted', label:'Contacted' },
  { value:'qualified', label:'Qualified' },
  { value:'proposal', label:'Proposal' },
  { value:'won', label:'Won' },
  { value:'lost', label:'Lost' },
];

export default function Leads() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newLead, setNewLead] = useState({name:'',email:'',company:'',source:'website' as any,status:'new' as LeadStatus});

  const { data: leadsData, isLoading, refetch } = useQuery({
    queryKey: ['leads', search, status],
    queryFn: async () => {
      const params: any = { page:1, limit:50 };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await api.get('/leads', { params });
      return res.data.data;
    }
  });

  const leads: Lead[] = leadsData?.data ?? [];

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leads', newLead);
      toast.success('Lead created successfully');
      setShowAdd(false);
      setNewLead({name:'',email:'',company:'',source:'website',status:'new'});
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    }
  };

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
      <PageHeader title="Leads" subtitle="Manage and track your leads">
        <Button onClick={()=>setShowAdd(true)} icon={<Plus className="h-4 w-4"/>}>Add Lead</Button>
      </PageHeader>
      <Card className="mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1"><Input icon={<Search className="h-4 w-4"/>} placeholder="Search leads..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <Select icon={<Filter className="h-4 w-4"/>} options={statusOptions} value={status} onChange={e=>setStatus(e.target.value)} className="w-full sm:w-48"/>
        </div>
      </Card>
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-600"/></div>
      ) : leads.length === 0 ? (
        <EmptyState title="No leads found" description="Get started by adding your first lead." action={<Button onClick={()=>setShowAdd(true)} icon={<Plus className="h-4 w-4"/>}>Add Lead</Button>}/>
      ) : (
        <div className="space-y-3">
          {leads.map((lead: Lead)=>(
            <Card key={lead._id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{lead.name[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{lead.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3"/> {lead.email}</span>
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3"/> {lead.company}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={lead.status}/>
                  {lead.score !== undefined && <ScoreBadge lead={lead} size="sm" showLabel={false}/>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="Add New Lead" description="Create a new lead in your CRM">
        <form onSubmit={handleAddLead} className="space-y-4">
          <Input label="Name" value={newLead.name} onChange={e=>setNewLead({...newLead,name:e.target.value})} required/>
          <Input label="Email" type="email" value={newLead.email} onChange={e=>setNewLead({...newLead,email:e.target.value})} required/>
          <Input label="Company" value={newLead.company} onChange={e=>setNewLead({...newLead,company:e.target.value})} required/>
          <Select label="Source" options={[{value:'website',label:'Website'},{value:'linkedin',label:'LinkedIn'},{value:'referral',label:'Referral'},{value:'ads',label:'Ads'},{value:'event',label:'Event'}]} value={newLead.source} onChange={e=>setNewLead({...newLead,source:e.target.value})}/>
          <Select label="Status" options={statusOptions.filter(o=>o.value)} value={newLead.status} onChange={e=>setNewLead({...newLead,status:e.target.value as LeadStatus})}/>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={()=>setShowAdd(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Create Lead</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
