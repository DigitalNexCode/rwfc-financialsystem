import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Mail, Phone, Building, FileText, CheckSquare, Upload, Plus, Edit, Trash2,
  MessageSquare, Download, Lock, Unlock, Send, Paperclip, User, Eye, Calendar, BarChart2
} from 'lucide-react';
import { faker } from '@faker-js/faker';
import { useAuth } from '../contexts/AuthContext';
import { 
  getConversationByClientId, 
  claimConversation, 
  addMessageToConversation,
  Conversation,
  ClientMessage
} from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ClientDocument {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  status: 'processed' | 'pending' | 'review';
  category: string;
}

interface ClientTask {
  id: number;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignedTo: string;
}

const ClientDetail: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'tasks' | 'messages'>('overview');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Mock data generation
  const [clientData] = useState(() => ({
    id: Number(id),
    name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    vatNumber: `VAT${faker.number.int({ min: 100000, max: 999999 })}`,
    registrationNumber: `REG${faker.date.past().getFullYear()}/${faker.number.int({ min: 100000, max: 999999 })}/07`,
    address: faker.location.streetAddress(true),
    status: 'active' as const,
    joinDate: faker.date.past({ years: 2 }).toISOString().split('T')[0],
    nextDeadline: faker.date.future().toISOString().split('T')[0],
    accountManager: faker.person.fullName(),
  }));

  const [documents] = useState<ClientDocument[]>(() => Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    name: faker.system.fileName({ extensionCount: 1 }),
    type: faker.helpers.arrayElement(['PDF', 'Excel', 'Word', 'Image']),
    size: `${faker.number.int({ min: 100, max: 5000 })} KB`,
    uploadDate: faker.date.recent().toISOString().split('T')[0],
    status: faker.helpers.arrayElement(['processed', 'pending', 'review']),
    category: faker.helpers.arrayElement(['Invoice', 'Bank Statement', 'Tax Document', 'Contract']),
  })));

  const [tasks] = useState<ClientTask[]>(() => Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    title: faker.helpers.arrayElement(['VAT201 Preparation', 'Monthly Bookkeeping', 'ITR14 Review', 'Payroll Processing']),
    status: faker.helpers.arrayElement(['pending', 'in-progress', 'completed']),
    priority: faker.helpers.arrayElement(['high', 'medium', 'low']),
    dueDate: faker.date.future().toISOString().split('T')[0],
    assignedTo: faker.person.fullName(),
  })));

  useEffect(() => {
    if (id) {
      const convo = getConversationByClientId(Number(id));
      setConversation(convo || null);
    }
  }, [id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !conversation || !user) return;

    if (conversation.status === 'unassigned') {
      claimConversation(conversation.id, user.id, user.full_name);
      const systemMessage: Omit<ClientMessage, 'id'> = { from: 'staff', text: `You have claimed this conversation. It is now private and encrypted.`, author: 'System', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isEncrypted: true };
      addMessageToConversation(conversation.id, systemMessage);
    }

    const messageToSend: Omit<ClientMessage, 'id'> = { from: 'staff', text: newMessage, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), author: user.full_name, isEncrypted: true };
    addMessageToConversation(conversation.id, messageToSend);
    setNewMessage('');
    setConversation({ ...getConversationByClientId(Number(id))! });
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Building },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'tasks', name: 'Tasks', icon: CheckSquare },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'processed': return 'bg-green-100 text-green-800';
      case 'in-progress': case 'pending': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
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
  
  const OverviewTab = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3"><Mail className="w-4 h-4 text-muted-foreground" /> <span className="text-sm">{clientData.email}</span></div>
          <div className="flex items-center space-x-3"><Phone className="w-4 h-4 text-muted-foreground" /> <span className="text-sm">{clientData.phone}</span></div>
          <div className="flex items-center space-x-3"><Building className="w-4 h-4 text-muted-foreground" /> <span className="text-sm">{clientData.address}</span></div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-1">
        <CardHeader><CardTitle>Company Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span>VAT Number:</span> <span className="font-medium">{clientData.vatNumber}</span></div>
          <div className="flex justify-between"><span>Reg Number:</span> <span className="font-medium">{clientData.registrationNumber}</span></div>
          <div className="flex justify-between"><span>Status:</span> <span className="font-medium capitalize text-green-600">{clientData.status}</span></div>
          <div className="flex justify-between"><span>Join Date:</span> <span className="font-medium">{clientData.joinDate}</span></div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-1">
        <CardHeader><CardTitle>Key Metrics</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between items-center"><div className="flex items-center space-x-2"><FileText className="w-4 h-4 text-blue-500"/><span>Total Documents</span></div><span className="font-bold text-lg">{documents.length}</span></div>
          <div className="flex justify-between items-center"><div className="flex items-center space-x-2"><CheckSquare className="w-4 h-4 text-green-500"/><span>Open Tasks</span></div><span className="font-bold text-lg">{tasks.filter(t => t.status !== 'completed').length}</span></div>
          <div className="flex justify-between items-center"><div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-red-500"/><span>Next Deadline</span></div><span className="font-medium">{clientData.nextDeadline}</span></div>
          <div className="flex justify-between items-center"><div className="flex items-center space-x-2"><User className="w-4 h-4 text-purple-500"/><span>Account Manager</span></div><span className="font-medium">{clientData.accountManager}</span></div>
        </CardContent>
      </Card>
    </div>
  );

  const DocumentsTab = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Client Documents</h3>
        <Button variant="outline"><Upload className="w-4 h-4 mr-2" /> Upload Document</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><th className="px-6 py-3">Document Name</th><th className="px-6 py-3">Category</th><th className="px-6 py-3">Upload Date</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Actions</th></tr></thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><FileText className="w-5 h-5 text-gray-400 mr-3" /><div><div className="text-sm font-medium text-gray-900">{doc.name}</div><div className="text-sm text-gray-500">{doc.type} • {doc.size}</div></div></div></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.uploadDate}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>{doc.status}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex items-center space-x-2"><button className="text-blue-600 hover:text-blue-900"><Eye className="w-4 h-4" /></button><button className="text-green-600 hover:text-green-900"><Download className="w-4 h-4" /></button><button className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TasksTab = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Client Tasks</h3>
        <Button><Plus className="w-4 h-4 mr-2" /> Add Task</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><th className="px-6 py-3">Task</th><th className="px-6 py-3">Assigned To</th><th className="px-6 py-3">Priority</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Due Date</th><th className="px-6 py-3">Actions</th></tr></thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map(task => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.assignedTo}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span></td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>{task.status}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex items-center space-x-2"><button className="text-blue-600 hover:text-blue-900"><Edit className="w-4 h-4" /></button><button className="text-green-600 hover:text-green-900"><CheckSquare className="w-4 h-4" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMessageContent = () => {
    if (!conversation) return <div className="text-center p-8 text-gray-500">No messages with this client yet.</div>;
    if (conversation.status === 'assigned' && conversation.assigneeId !== user?.id) return <div className="text-center p-8 text-gray-500"><Lock className="w-10 h-10 mx-auto mb-2 text-yellow-500" /><p className="font-medium">This conversation is private.</p><p>It is being handled by {conversation.assigneeName}.</p></div>;
    return (
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {conversation.messages.map(msg => {
          const isStaff = msg.from === 'staff';
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isStaff ? 'justify-end' : 'justify-start'}`}>
              {!isStaff && (<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-gray-600" /></div>)}
              <div className={`max-w-md p-3 rounded-lg ${isStaff ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                <p className="text-sm">{msg.text}</p>
                <div className={`flex items-center gap-2 mt-1 ${isStaff ? 'text-blue-200' : 'text-gray-500'}`}>
                  {msg.isEncrypted && <Lock className="w-3 h-3" />}
                  <p className="text-xs">{msg.author} • {msg.timestamp}</p>
                </div>
              </div>
              {isStaff && (<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/clients" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1"><h1 className="text-2xl font-bold text-gray-900">{clientData.name}</h1><p className="text-gray-600 mt-1">Client Details & Management</p></div>
        <div className="flex space-x-3"><Button variant="outline"><Edit className="w-4 h-4 mr-2" />Edit</Button><Button onClick={() => setActiveTab('messages')}><MessageSquare className="w-4 h-4 mr-2" />Message</Button></div>
      </div>
      <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-8">{tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><tab.icon className="w-4 h-4" /><span>{tab.name}</span></button>))}</nav></div>
      <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {activeTab === 'overview' && OverviewTab}
        {activeTab === 'documents' && DocumentsTab}
        {activeTab === 'tasks' && TasksTab}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[70vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div><h3 className="text-lg font-semibold text-gray-900">Secure Messages</h3><p className="text-sm text-gray-600">Conversation with {clientData.name}</p></div>
              {conversation?.status === 'assigned' && <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"><Lock className="w-4 h-4" /><span>Encrypted & Private</span></div>}
              {conversation?.status === 'unassigned' && <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"><Unlock className="w-4 h-4" /><span>Unassigned</span></div>}
            </div>
            {renderMessageContent()}
            {conversation && (conversation.status === 'unassigned' || conversation.assigneeId === user?.id) && (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="relative">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="w-full pl-4 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <button type="button" className="p-2 text-gray-500 hover:text-gray-700"><Paperclip className="w-5 h-5" /></button>
                    <button type="submit" className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"><Send className="w-5 h-5" /></button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ClientDetail;
