import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  Plus, Search, Filter, Edit, Trash2, UserPlus, Users, Shield, CheckCircle, XCircle, MoreVertical
} from 'lucide-react';
import { faker } from '@faker-js/faker';
import Modal from '@/components/ui/Modal';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { Button } from '@/components/ui/Button';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'staff' | 'client';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdDate: string;
  assignedClients: number;
}

const generateMockUsers = (count: number): User[] => Array.from({ length: count }, (_, index) => ({
  id: index + 1,
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  role: faker.helpers.arrayElement(['admin', 'manager', 'staff', 'client'] as const),
  status: faker.helpers.arrayElement(['active', 'inactive'] as const),
  lastLogin: faker.date.recent().toISOString().split('T')[0],
  createdDate: faker.date.past().toISOString().split('T')[0],
  assignedClients: faker.number.int({ min: 0, max: 20 }),
}));

const userSchema = yup.object().shape({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  role: yup.string().oneOf(['admin', 'manager', 'staff', 'client']).required('Role is required'),
});

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => generateMockUsers(25));
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'staff' | 'client'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(userSchema),
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    reset(user || { name: '', email: '', role: 'staff' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const onSubmit = (data: any) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
    } else {
      const newUser: User = {
        id: users.length + 1,
        ...data,
        phone: faker.phone.number(),
        status: 'active',
        lastLogin: new Date().toISOString().split('T')[0],
        createdDate: new Date().toISOString().split('T')[0],
        assignedClients: 0,
      };
      setUsers([newUser, ...users]);
    }
    handleCloseModal();
  };

  const handleDeleteUser = () => {
    if (deletingUserId) {
      setUsers(users.filter(u => u.id !== deletingUserId));
      setDeletingUserId(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'client': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and permissions.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
              <option value="client">Client</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold">{user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>{user.role}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-2">{user.status === 'active' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}<span className="text-sm text-gray-900 capitalize">{user.status}</span></div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleOpenModal(user)} className="text-blue-600 hover:text-blue-900"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeletingUserId(user.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Edit User' : 'Add New User'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input {...register('name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter full name" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email')} type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter email address" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select {...register('role')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="client">Client</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">{editingUser ? 'Save Changes' : 'Add User'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deletingUserId !== null}
        onClose={() => setDeletingUserId(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
};

export default UserManagement;
