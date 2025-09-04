import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  Search, Plus, Filter, MoreVertical, Users, Building, Mail, Phone, Edit, Trash2, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Client } from '../types/supabase';
import Modal from '@/components/ui/Modal';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

const clientSchema = yup.object().shape({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  company: yup.string().required('Company name is required'),
  vat_number: yup.string().required('VAT number is required'),
  phone: yup.string().optional(),
});

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(clientSchema),
  });

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching clients:', error);
      setError(error.message);
    } else {
      setClients(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.vat_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (client: Client | null = null) => {
    setEditingClient(client);
    reset(client || { name: '', email: '', company: '', vat_number: '', phone: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const onSubmit = async (data: any) => {
    if (editingClient) {
      const { error } = await supabase.from('clients').update(data).eq('id', editingClient.id);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.from('clients').insert([data]);
      if (error) setError(error.message);
    }
    await fetchClients();
    handleCloseModal();
  };

  const handleDeleteClient = async () => {
    if (deletingClientId) {
      const { error } = await supabase.from('clients').delete().eq('id', deletingClientId);
      if (error) setError(error.message);
      else setClients(clients.filter(c => c.id !== deletingClientId));
      setDeletingClientId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client relationships and accounts.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search clients by name, company, or VAT number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <span className="text-destructive text-sm">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-card rounded-xl shadow-sm border p-6 space-y-4">
              <div className="flex items-center space-x-3"><Skeleton className="w-12 h-12 rounded-lg" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-24" /></div></div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-card rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                      {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">{client.company}</p>
                  </div>
                </div>
                <div className="relative group">
                  <button className="text-muted-foreground hover:text-foreground p-1"><MoreVertical className="w-4 h-4" /></button>
                  <div className="absolute right-0 mt-1 w-32 bg-popover rounded-md shadow-lg border z-10 hidden group-hover:block">
                    <button onClick={() => handleOpenModal(client)} className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent flex items-center"><Edit className="w-4 h-4 mr-2" /> Edit</button>
                    <button onClick={() => setDeletingClientId(client.id)} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent flex items-center"><Trash2 className="w-4 h-4 mr-2" /> Delete</button>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4 flex-grow">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground"><Mail className="w-4 h-4" /> <span className="truncate">{client.email}</span></div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground"><Building className="w-4 h-4" /> <span>{client.vat_number}</span></div>
              </div>
              <div className="flex space-x-2 mt-auto">
                <Link to={`/clients/${client.id}`} className="flex-1"><Button variant="secondary" className="w-full">View Details</Button></Link>
                <Button variant="outline">Message</Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredClients.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No clients found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search criteria or add a new client.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingClient ? 'Edit Client' : 'Add New Client'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><label className="block text-sm font-medium text-foreground mb-1">Full Name</label><input {...register('name')} className="w-full px-3 py-2 border border-input bg-background rounded-lg" placeholder="Enter client name" />{errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}</div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Email</label><input {...register('email')} type="email" className="w-full px-3 py-2 border border-input bg-background rounded-lg" placeholder="Enter email address" />{errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}</div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Company</label><input {...register('company')} className="w-full px-3 py-2 border border-input bg-background rounded-lg" placeholder="Enter company name" />{errors.company && <p className="text-destructive text-xs mt-1">{errors.company.message}</p>}</div>
          <div><label className="block text-sm font-medium text-foreground mb-1">VAT Number</label><input {...register('vat_number')} className="w-full px-3 py-2 border border-input bg-background rounded-lg" placeholder="Enter VAT number" />{errors.vat_number && <p className="text-destructive text-xs mt-1">{errors.vat_number.message}</p>}</div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Phone (Optional)</label><input {...register('phone')} className="w-full px-3 py-2 border border-input bg-background rounded-lg" placeholder="Enter phone number" />{errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}</div>
          <div className="flex justify-end space-x-3 pt-4"><Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button><Button type="submit">{editingClient ? 'Save Changes' : 'Add Client'}</Button></div>
        </form>
      </Modal>

      <ConfirmationDialog isOpen={deletingClientId !== null} onClose={() => setDeletingClientId(null)} onConfirm={handleDeleteClient} title="Delete Client" message="Are you sure you want to delete this client? This action cannot be undone." />
    </div>
  );
};

export default Clients;
