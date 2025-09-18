// src/types.ts

export interface User {
  email: string;
  password: string;
  name: string;
  role: string;
  avatar: string;
  department: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  description?: string;
  startDate?: string;
  attachments?: AttachedFile[];
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Project {
  id: string;
  name: string;
  progress: number;
  status: 'active' | 'inactive';
  dueDate: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  content: string;
  comments: Comment[];
  attendees?: string[];
  attachments?: AttachedFile[];
}

export interface Comment {
  id: string;
  text?: string;
  author: string;
  timestamp: string;
  content?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  type: 'sent' | 'received';
}
