import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, Upload, MessageSquare, FileText, CheckSquare, Calendar, Bell, Paperclip, Send, User
} from 'lucide-react';
import { faker } from '@faker-js/faker';
import { 
  findOrCreateConversationForClient, 
  addMessageToConversation,
  Conversation,
  ClientMessage
} from '@/data/mockData';

interface ClientTask { id: number; title: string; status: 'pending' | 'awaiting-info' | 'completed'; dueDate: string; description: string; }
interface ClientDocument { id: number; name: string; uploadDate: string; status: 'processing' | 'reviewed' | 'action-required'; }

const ClientPortal: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'documents' | 'messages'>('dashboard');
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);

  // Mock data for other tabs
  const [tasks] = useState<ClientTask[]>(() => Array.from({ length: 4 }, (_, index) => ({ id: index + 1, title: faker.helpers.arrayElement(['Submit Bank Statements for Jan 2025', 'Review Draft Financial Statements']), status: faker.helpers.arrayElement(['pending', 'awaiting-info', 'completed']), dueDate: faker.date.future().toISOString().split('T')[0], description: faker.lorem.sentence(), })));
  const [documents, setDocuments] = useState<ClientDocument[]>(() => Array.from({ length: 6 }, (_, index) => ({ id: index + 1, name: faker.system.fileName({ extensionCount: 1 }), uploadDate: faker.date.recent().toISOString().split('T')[0], status: faker.helpers.arrayElement(['processing', 'reviewed', 'action-required']), })));

  useEffect(() => {
    if (user) {
      const convo = findOrCreateConversationForClient(user.id, user.full_name, user.full_name.split(' ').map(n => n[0]).join(''));
      setConversation(convo);
    }
  }, [user]);

  const onDrop = (acceptedFiles: File[]) => {
    console.log('Client uploaded files:', acceptedFiles);
    // Handle file upload here
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !conversation || !user) return;

    const messageToSend: Omit<ClientMessage, 'id'> = {
      from: 'client',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: user.full_name,
    };

    addMessageToConversation(conversation.id, messageToSend);
    setNewMessage('');
    // Refresh conversation state
    setConversation({ ...findOrCreateConversationForClient(user.id, user.full_name, user.full_name.split(' ').map(n => n[0]).join('')) });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'reviewed': return 'bg-green-100 text-green-800';
      case 'pending': case 'processing': return 'bg-blue-100 text-blue-800';
      case 'awaiting-info': case 'action-required': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [ { id: 'dashboard', name: 'Dashboard', icon: Home }, { id: 'documents', name: 'Upload Documents', icon: Upload }, { id: 'messages', name: 'Messages', icon: MessageSquare }, ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name}!</h1><p className="text-gray-600 mt-1">This is your secure client portal.</p></div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4"><Bell className="w-6 h-6 text-gray-500" /><div className="flex items-center space-x-2"><div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-white" /></div><span className="text-sm font-medium text-gray-900">{user?.full_name}</span></div></div>
        </div>
      </div>

      <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-8">{tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><tab.icon className="w-4 h-4" /><span>{tab.name}</span></button>))}</nav></div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {activeTab === 'dashboard' && ( <div>{/* Dashboard Content Here */}</div> )}
        {activeTab === 'documents' && ( <div>{/* Documents Content Here */}</div> )}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[70vh] flex flex-col">
            <div className="p-4 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-900">Secure Messages</h3><p className="text-sm text-gray-600">Communicate with your account manager</p></div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {conversation?.messages.map(msg => (
                <div key={msg.id} className={`flex items-end gap-2 ${msg.from === 'client' ? 'justify-end' : 'justify-start'}`}>
                  {msg.from === 'staff' && (<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-gray-600" /></div>)}
                  <div className={`max-w-md p-3 rounded-lg ${msg.from === 'client' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.from === 'client' ? 'text-blue-200' : 'text-gray-500'}`}>{msg.author} • {msg.timestamp}</p>
                  </div>
                  {msg.from === 'client' && (<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>)}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="relative">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="w-full pl-4 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <button type="button" className="p-2 text-gray-500 hover:text-gray-700"><Paperclip className="w-5 h-5" /></button>
                  <button type="submit" className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"><Send className="w-5 h-5" /></button>
                </div>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ClientPortal;
