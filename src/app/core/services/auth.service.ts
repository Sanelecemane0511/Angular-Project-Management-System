import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, TeamMember } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  private allUsersSignal    = signal<User[]>([]);

  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly currentUser     = computed(() => this.currentUserSignal());
  readonly isManager       = computed(() => this.currentUserSignal()?.role === 'manager');
  readonly users           = computed(() => this.allUsersSignal());

  constructor(private router: Router) { this.seedUsers(); }

  login(req: { email: string; password: string }): boolean {
    const user = this.allUsersSignal().find(u => u.email === req.email && u.password === req.password);
    if (!user) return false;
    this.currentUserSignal.set(user);
    this.router.navigate(['/dashboard']);
    return true;
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  switchUser(userId: string): void {
    const u = this.allUsersSignal().find(x => x.id === userId) ?? null;
    this.currentUserSignal.set(u);
  }

  getTeamMembers(): TeamMember[] {
    return this.allUsersSignal().map(u => ({
      id: u.id, name: u.name, email: u.email, role: u.role,
      assignedDate: new Date(),
      permissions: u.role === 'manager'
        ? ['create-tasks','edit-tasks','delete-tasks','assign-tasks','manage-team']
        : ['create-tasks','edit-tasks']
    }));
  }

  addUser(user: Omit<User,'id'>): User {
    const newUser: User = { ...user, id: `user-${Date.now()}` };
    this.allUsersSignal.update(list => [...list, newUser]);
    return newUser;
  }

  updateUser(id: string, changes: Partial<User>): void {
    this.allUsersSignal.update(list => list.map(u => u.id === id ? { ...u, ...changes } : u));
  }

  deleteUser(id: string): void {
    this.allUsersSignal.update(list => list.filter(u => u.id !== id));
  }

  private seedUsers(): void {
    this.allUsersSignal.set([
      { id: 'user-1', name: 'Sarah Johnson', email: 'sarah@company.com', password: 'Manager@2025', role: 'manager' },
      { id: 'user-2', name: 'Mike Chen',      email: 'mike@company.com',  password: 'Team2025!',   role: 'team-member' },
      { id: 'user-3', name: 'Emily Davis',    email: 'emily@company.com', password: 'Team2025!',   role: 'team-member' }
    ]);
  }
}