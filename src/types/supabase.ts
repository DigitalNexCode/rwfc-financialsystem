export interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'manager' | 'staff' | 'client';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  vat_number: string;
  status: 'active' | 'inactive';
  account_manager_id?: string;
}

export interface Task {
  id: number;
  created_at: string;
  title: string;
  description?: string;
  client_id?: number;
  assignee_id?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  due_date?: string;
}
