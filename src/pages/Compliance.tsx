import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { 
  Calendar, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Filter,
  Search,
  Bell,
  FileText,
  Download
} from 'lucide-react';
import { faker } from '@faker-js/faker';

interface ComplianceItem {
  id: number;
  type: string;
  description: string;
  client: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  documents: string[];
  notes: string;
}

interface ComplianceTemplate {
  id: number;
  name: string;
  type: 'VAT201' | 'EMP201' | 'ITR14' | 'PAYE' | 'SDL' | 'UIF';
  frequency: 'monthly' | 'quarterly' | 'annually' | 'bi-annually';
  dueDay: number;
  description: string;
  requiredDocuments: string[];
}

const Compliance: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list' | 'templates'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed' | 'overdue'>('all');

  // Generate mock compliance items
  const mockComplianceItems: ComplianceItem[] = Array.from({ length: 30 }, (_, index) => {
    const dueDate = faker.date.between({ 
      from: startOfMonth(currentDate), 
      to: endOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() + 2)) 
    });
    const today = new Date();
    let status: 'pending' | 'in-progress' | 'completed' | 'overdue' = 'pending';
    
    if (dueDate < today) {
      status = faker.helpers.arrayElement(['completed', 'overdue']);
    } else {
      status = faker.helpers.arrayElement(['pending', 'in-progress']);
    }

    return {
      id: index + 1,
      type: faker.helpers.arrayElement(['VAT201', 'EMP201', 'ITR14', 'PAYE', 'SDL', 'UIF']),
      description: faker.helpers.arrayElement([
        'Monthly VAT Return',
        'Employer Monthly Return',
        'Annual Income Tax Return',
        'PAYE Monthly Return',
        'Skills Development Levy',
        'Unemployment Insurance Fund'
      ]),
      client: faker.company.name(),
      dueDate: dueDate.toISOString().split('T')[0],
      status,
      priority: faker.helpers.arrayElement(['high', 'medium', 'low'] as const),
      assignee: faker.person.fullName(),
      documents: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.system.fileName()),
      notes: faker.lorem.sentence(),
    };
  });

  const complianceTemplates: ComplianceTemplate[] = [
    {
      id: 1,
      name: 'VAT201 - Monthly VAT Return',
      type: 'VAT201',
      frequency: 'monthly',
      dueDay: 25,
      description: 'Monthly Value Added Tax return submission',
      requiredDocuments: ['Sales invoices', 'Purchase invoices', 'Bank statements', 'VAT reconciliation']
    },
    {
      id: 2,
      name: 'EMP201 - Employer Monthly Return',
      type: 'EMP201',
      frequency: 'monthly',
      dueDay: 7,
      description: 'Monthly employer return for PAYE, SDL, and UIF',
      requiredDocuments: ['Payroll reports', 'Employee certificates', 'IRP5 forms']
    },
    {
      id: 3,
      name: 'ITR14 - Company Income Tax Return',
      type: 'ITR14',
      frequency: 'annually',
      dueDay: 31,
      description: 'Annual company income tax return',
      requiredDocuments: ['Financial statements', 'Trial balance', 'Supporting schedules']
    },
    {
      id: 4,
      name: 'PAYE - Pay As You Earn',
      type: 'PAYE',
      frequency: 'monthly',
      dueDay: 7,
      description: 'Monthly PAYE deductions and submissions',
      requiredDocuments: ['Payroll summary', 'Employee tax certificates']
    }
  ];

  const filteredItems = mockComplianceItems.filter(item => {
    return statusFilter === 'all' || item.status === statusFilter;
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getItemsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return mockComplianceItems.filter(item => item.dueDate === dateStr);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Calendar</h1>
          <p className="text-gray-600 mt-1">Track and manage all compliance deadlines and requirements.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setView('templates')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'templates'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Deadline</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'This Month', 
            value: mockComplianceItems.filter(item => {
              const itemDate = new Date(item.dueDate);
              return isSameMonth(itemDate, currentDate);
            }).length, 
            icon: Calendar, 
            color: 'blue' 
          },
          { 
            label: 'Overdue', 
            value: mockComplianceItems.filter(item => item.status === 'overdue').length, 
            icon: AlertTriangle, 
            color: 'red' 
          },
          { 
            label: 'In Progress', 
            value: mockComplianceItems.filter(item => item.status === 'in-progress').length, 
            icon: Clock, 
            color: 'blue' 
          },
          { 
            label: 'Completed', 
            value: mockComplianceItems.filter(item => item.status === 'completed').length, 
            icon: CheckCircle, 
            color: 'green' 
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content based on view */}
      {view === 'calendar' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthDays.map(day => {
              const items = getItemsForDate(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-24 p-2 border border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    isToday(day) ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className={`text-sm ${isToday(day) ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1 mt-1">
                    {items.slice(0, 2).map(item => (
                      <div
                        key={item.id}
                        className={`text-xs p-1 rounded truncate ${getStatusColor(item.status)}`}
                        title={`${item.type} - ${item.client}`}
                      >
                        {item.type}
                      </div>
                    ))}
                    {items.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{items.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {view === 'list' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search compliance items..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compliance Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(item.status)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{item.type}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.assignee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-orange-600 hover:text-orange-900">
                          <Bell className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {view === 'templates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Compliance Templates</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Template</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {complianceTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {template.frequency}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Due Day:</span>
                      <span className="font-medium text-gray-900">{template.dueDay}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-500">Required Documents:</span>
                      <div className="mt-1 space-y-1">
                        {template.requiredDocuments.slice(0, 3).map((doc, i) => (
                          <div key={i} className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
                            {doc}
                          </div>
                        ))}
                        {template.requiredDocuments.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{template.requiredDocuments.length - 3} more documents
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                      Use Template
                    </button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Edit
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Selected Date Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {getItemsForDate(selectedDate).map(item => (
                <div key={item.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{item.type}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                  <p className="text-sm text-gray-500">Client: {item.client}</p>
                  <p className="text-sm text-gray-500">Assignee: {item.assignee}</p>
                </div>
              ))}
              {getItemsForDate(selectedDate).length === 0 && (
                <p className="text-gray-500 text-center py-4">No compliance items for this date.</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setSelectedDate(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Deadline Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Compliance Deadline</h3>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select compliance type</option>
                  <option value="VAT201">VAT201</option>
                  <option value="EMP201">EMP201</option>
                  <option value="ITR14">ITR14</option>
                  <option value="PAYE">PAYE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select client</option>
                  <option value="1">ABC Manufacturing</option>
                  <option value="2">XYZ Trading</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Add Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compliance;
