import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  Plus, Search, Filter, Edit, Trash2
} from 'lucide-react';
import { faker } from '@faker-js/faker';
import Modal from '@/components/ui/Modal';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { Button } from '@/components/ui/Button';

interface Task {
  id: number;
  title: string;
  description: string;
  client: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
}

const generateMockTasks = (count: number): Task[] => Array.from({ length: count }, (_, index) => ({
  id: index + 1,
  title: faker.hacker.phrase().replace(/^./, (letter) => letter.toUpperCase()),
  description: faker.lorem.sentences(2),
  client: faker.company.name(),
  assignee: faker.person.fullName(),
  priority: faker.helpers.arrayElement(['high', 'medium', 'low'] as const),
  status: faker.helpers.arrayElement(['pending', 'in-progress', 'completed'] as const),
  dueDate: faker.date.future().toISOString().split('T')[0],
}));

const taskSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  client: yup.string().required('Client is required'),
  assignee: yup.string().required('Assignee is required'),
  dueDate: yup.string().required('Due date is required'),
  priority: yup.string().oneOf(['high', 'medium', 'low']).required('Priority is required'),
  description: yup.string(),
});

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => generateMockTasks(20));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(taskSchema),
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleOpenModal = (task: Task | null = null) => {
    setEditingTask(task);
    reset(task || { title: '', client: '', assignee: '', dueDate: new Date().toISOString().split('T')[0], priority: 'medium', description: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const onSubmit = (data: any) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...data } : t));
    } else {
      const newTask: Task = {
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        ...data,
        status: 'pending',
      };
      setTasks([newTask, ...tasks]);
    }
    handleCloseModal();
  };

  const handleDeleteTask = () => {
    if (deletingTaskId) {
      setTasks(tasks.filter(t => t.id !== deletingTaskId));
      setDeletingTaskId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage and track your team's workflow.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks, clients, or assignees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex space-x-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task, index) => (
                <motion.tr key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-500">{task.client}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.assignee}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>{task.status.replace('-', ' ')}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleOpenModal(task)} className="text-blue-600 hover:text-blue-900"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeletingTaskId(task.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTask ? 'Edit Task' : 'Create New Task'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input {...register('title')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter task title" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter task description"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <input {...register('client')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Client name" />
              {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <input {...register('assignee')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Assignee name" />
              {errors.assignee && <p className="text-red-500 text-xs mt-1">{errors.assignee.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select {...register('priority')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input {...register('dueDate')} type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">{editingTask ? 'Save Changes' : 'Create Task'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deletingTaskId !== null}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
};

export default Tasks;
