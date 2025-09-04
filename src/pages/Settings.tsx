import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  Save, Plus, Edit, Trash2, Settings as SettingsIcon, FileText, Bell, Shield, Database
} from 'lucide-react';
import { faker } from '@faker-js/faker';
import Modal from '@/components/ui/Modal';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { Button } from '@/components/ui/Button';

interface ServiceTemplate {
  id: number;
  name: string;
  type: 'VAT' | 'Payroll' | 'Audit' | 'Tax' | 'Bookkeeping' | 'Compliance';
  description: string;
  tasks: string[];
  estimatedHours: number;
  price: number;
}

const generateMockTemplates = (count: number): ServiceTemplate[] => [
  { id: 1, name: 'Monthly VAT Return', type: 'VAT', description: 'Complete monthly VAT201 preparation and submission', tasks: ['Collect VAT documents', 'Reconcile VAT accounts', 'Prepare VAT201', 'Submit to SARS'], estimatedHours: 4, price: 1500 },
  { id: 2, name: 'Full Payroll Service', type: 'Payroll', description: 'Complete monthly payroll processing service', tasks: ['Process payroll', 'Generate payslips', 'Submit EMP201', 'Handle queries'], estimatedHours: 8, price: 2500 },
  { id: 3, name: 'Annual Financial Audit', type: 'Audit', description: 'Comprehensive annual financial statement audit', tasks: ['Plan audit', 'Test controls', 'Substantive testing', 'Report preparation'], estimatedHours: 120, price: 45000 },
];

const templateSchema = yup.object().shape({
  name: yup.string().required('Template name is required'),
  type: yup.string().required('Service type is required'),
  description: yup.string().required('Description is required'),
  estimatedHours: yup.number().typeError('Must be a number').positive('Must be positive').required('Hours are required'),
  price: yup.number().typeError('Must be a number').positive('Must be positive').required('Price is required'),
  tasks: yup.string().required('Please list at least one task'),
});

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'audit'>('services');
  const [templates, setTemplates] = useState<ServiceTemplate[]>(() => generateMockTemplates(3));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ServiceTemplate | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(templateSchema),
  });

  const handleOpenModal = (template: ServiceTemplate | null = null) => {
    setEditingTemplate(template);
    if (template) {
      reset({ ...template, tasks: template.tasks.join('\n') });
    } else {
      reset({ name: '', type: 'VAT', description: '', estimatedHours: 0, price: 0, tasks: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const onSubmit = (data: any) => {
    const formattedData = { ...data, tasks: data.tasks.split('\n').filter((t: string) => t.trim() !== '') };
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...formattedData } : t));
    } else {
      const newTemplate: ServiceTemplate = {
        id: templates.length + 1,
        ...formattedData,
      };
      setTemplates([newTemplate, ...templates]);
    }
    handleCloseModal();
  };

  const handleDeleteTemplate = () => {
    if (deletingTemplateId) {
      setTemplates(templates.filter(t => t.id !== deletingTemplateId));
      setDeletingTemplateId(null);
    }
  };
  
  const getServiceTypeColor = (type: string) => {
    const colors = {
      VAT: 'bg-blue-100 text-blue-800',
      Payroll: 'bg-green-100 text-green-800',
      Audit: 'bg-purple-100 text-purple-800',
      Tax: 'bg-orange-100 text-orange-800',
      Bookkeeping: 'bg-yellow-100 text-yellow-800',
      Compliance: 'bg-red-100 text-red-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      {/* Service Templates */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Service Templates</h3>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Template
            </Button>
          </div>
          <p className="text-gray-600">Create and manage service templates for quick project setup.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getServiceTypeColor(template.type)}`}>
                    {template.type}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => handleOpenModal(template)} className="text-gray-400 hover:text-gray-600 p-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeletingTemplateId(template.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 flex-grow">{template.description}</p>

              <div className="flex items-center justify-between text-sm">
                <div><span className="text-gray-500">Hours:</span><span className="font-medium text-gray-900 ml-1">{template.estimatedHours}h</span></div>
                <div><span className="text-gray-500">Price:</span><span className="font-medium text-gray-900 ml-1">R{template.price.toLocaleString()}</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add/Edit Template Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTemplate ? 'Edit Service Template' : 'Create Service Template'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
            <input {...register('name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Monthly VAT Return" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select {...register('type')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="VAT">VAT</option><option value="Payroll">Payroll</option><option value="Audit">Audit</option>
              <option value="Tax">Tax</option><option value="Bookkeeping">Bookkeeping</option><option value="Compliance">Compliance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Est. Hours</label>
              <input {...register('estimatedHours')} type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 4" />
              {errors.estimatedHours && <p className="text-red-500 text-xs mt-1">{errors.estimatedHours.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (ZAR)</label>
              <input {...register('price')} type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 1500" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tasks (one per line)</label>
            <textarea {...register('tasks')} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
            {errors.tasks && <p className="text-red-500 text-xs mt-1">{errors.tasks.message}</p>}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">{editingTemplate ? 'Save Changes' : 'Create Template'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deletingTemplateId !== null}
        onClose={() => setDeletingTemplateId(null)}
        onConfirm={handleDeleteTemplate}
        title="Delete Template"
        message="Are you sure you want to delete this service template? This action cannot be undone."
      />
    </div>
  );
};

export default Settings;
