export interface Project {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'on-hold';
  managerId: string; 
  createdAt: Date;
  teamMembers: TeamMember[];
  teamSize: number;
  maxTeamSize: number;
}

export interface Task {
  id: string;
  projectId: string; 
  title: string;
  description: string;
  dueDate: Date;
  status: 'Not Started' | 'In Progress' | 'Completed';
  priority: 'low' | 'medium' | 'high';
  assigneeId: string; 
  assigneeName: string; 
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;        
  role: 'manager' | 'team-member';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TaskStats {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  overdue: number;
  highPriority: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'team-member';
  assignedDate: Date;
  permissions: string[]; 
}