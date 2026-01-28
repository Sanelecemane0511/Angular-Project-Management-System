import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Project, Task, User } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const users: User[] = [
      { id: 'user-1', name: 'Sarah Johnson', email: 'sarah@company.com', password: '4de18a21a', role: 'manager' },
      { id: 'user-2', name: 'Mike Chen',      email: 'mike@company.com',  password: '4de18a21a', role: 'team-member' },
      { id: 'user-3', name: 'Emily Davis',    email: 'emily@company.com', password: '4de18a21a', role: 'team-member' }
    ];

    const projects: Project[] = [
  {
    id: 'project-1',
    title: 'Website Redesign',
    description: 'Complete overhaul of company website with modern UI/UX',
    startDate: new Date('2025-11-01'),
    endDate: new Date('2025-12-15'),
    status: 'active',
    managerId: 'user-1',
    createdAt: new Date('2025-11-01'),
    teamMembers: [
      { id: 'user-2', name: 'Mike Chen', email: 'mike@company.com', role: 'team-member', assignedDate: new Date('2025-11-01'), permissions: ['create-tasks', 'edit-tasks'] },
      { id: 'user-3', name: 'Emily Davis', email: 'emily@company.com', role: 'team-member', assignedDate: new Date('2025-11-01'), permissions: ['create-tasks'] },
    ],
    teamSize: 2,
    maxTeamSize: 5,
  },
  {
    id: 'project-2',
    title: 'Mobile App Development',
    description: 'Build native iOS and Android apps',
    startDate: new Date('2025-11-15'),
    endDate: new Date('2026-02-01'),
    status: 'active',
    managerId: 'user-1',
    createdAt: new Date('2025-11-05'),
    teamMembers: [
      { id: 'user-3', name: 'Emily Davis', email: 'emily@company.com', role: 'team-member', assignedDate: new Date('2025-11-05'), permissions: ['create-tasks', 'edit-tasks'] },
    ],
    teamSize: 1,
    maxTeamSize: 4,
  },
];

    const tasks: Task[] = [
      {
        id: 'task-1',
        projectId: 'project-1',
        title: 'Design homepage mockup',
        description: 'Create 3 different design concepts for client review',
        dueDate: new Date('2025-11-15'),
        status: 'In Progress',
        priority: 'high',
        assigneeId: 'user-2',
        assigneeName: 'Mike Chen',
        createdAt: new Date('2025-11-07'),
      },
      {
        id: 'task-2',
        projectId: 'project-1',
        title: 'Setup development environment',
        description: 'Configure build pipeline and CI/CD',
        dueDate: new Date('2025-11-10'),
        status: 'Completed',
        priority: 'medium',
        assigneeId: 'user-3',
        assigneeName: 'Emily Davis',
        createdAt: new Date('2025-11-06'),
      },
      {
        id: 'task-3',
        projectId: 'project-2',
        title: 'Research target audience',
        description: 'Analyze user demographics and preferences',
        dueDate: new Date('2025-11-20'),
        status: 'Not Started',
        priority: 'high',
        assigneeId: 'user-2',
        assigneeName: 'Mike Chen',
        createdAt: new Date('2025-11-08'),
      },
      {
        id: 'task-4',
        projectId: 'project-1',
        title: 'Implement user authentication',
        description: 'Add login and registration system',
        dueDate: new Date('2025-11-25'),
        status: 'Not Started',
        priority: 'high',
        assigneeId: 'user-3',
        assigneeName: 'Emily Davis',
        createdAt: new Date('2025-11-09'),
      },
    ];

    return { projects, tasks, users };
  }
}