import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckSquare, 
  Users, 
  Calendar,
  MessageSquare,
  Inbox
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getUnassignedConversations, Conversation } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [unassignedConversations, setUnassignedConversations] = useState<Conversation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setUnassignedConversations(getUnassignedConversations());
      setLoading(false);
    }, 1500); // Simulate data fetching
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { name: 'Pending Tasks', value: '23', icon: CheckSquare, color: 'bg-blue-500' },
    { name: 'Documents Awaiting Review', value: '12', icon: FileText, color: 'bg-green-500' },
    { name: 'Active Clients', value: '89', icon: Users, color: 'bg-purple-500' },
    { name: 'Upcoming Deadlines', value: '7', icon: Calendar, color: 'bg-orange-500' }
  ];

  const chartData = [
    { month: 'Jul', tasks: 65, documents: 45 },
    { month: 'Aug', tasks: 72, documents: 52 },
    { month: 'Sep', tasks: 68, documents: 48 },
    { month: 'Oct', tasks: 78, documents: 61 },
    { month: 'Nov', tasks: 82, documents: 68 },
    { month: 'Dec', tasks: 89, documents: 73 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your workflow.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button variant="outline">Export Report</Button>
          <Button>Quick Action</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}><CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-4 w-full" /></CardContent></Card>
          ))
        ) : (
          stats.map((stat, index) => (
            <motion.div key={stat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                  <div className={`${stat.color} p-2 rounded-lg`}><stat.icon className="w-5 h-5 text-white" /></div>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly Activity</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="w-full h-[300px]" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="tasks" fill="hsl(var(--primary))" name="Tasks" /><Bar dataKey="documents" fill="hsl(var(--secondary))" name="Documents" /></BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2"><Inbox className="w-5 h-5" /><span>Shared Inbox</span></CardTitle>
            <CardDescription>New messages from clients awaiting response.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : (
              <div className="space-y-3">
                {unassignedConversations.length > 0 ? unassignedConversations.map(convo => (
                  <motion.div
                    key={convo.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 p-3 bg-secondary rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/clients/${convo.clientId}`)}
                  >
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center font-semibold text-blue-700">{convo.clientAvatar}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-secondary-foreground text-sm">{convo.clientName}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(convo.lastMessageTimestamp, { addSuffix: true })}</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{convo.messages[convo.messages.length - 1].text}</p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-8">
                    <CheckSquare className="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Inbox is clear!</p>
                    <p className="text-xs text-muted-foreground">No unassigned messages.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
