import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskStats } from '../models/project.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly apiUrl = 'api/tasks';

  private tasksSignal = signal<Task[]>([]);
  tasks = computed(() => this.tasksSignal());

  myTasks = computed(() => {
    const userId = this.authService.currentUser()?.id;
    return userId ? this.tasks().filter(t => t.assigneeId === userId) : [];
  });

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadTasks();
  }

  loadTasks(): void {
    this.http.get<Task[]>(this.apiUrl).subscribe({
      next: (tasks) => {
        this.tasksSignal.set(tasks);
        console.log(`Loaded ${tasks.length} tasks`);
      },
      error: (error) => console.error('Error loading tasks:', error),
    });
  }

  getTasksByProjectId(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}?projectId=${projectId}`);
  }

  getTask(id: string): Observable<Task | undefined> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(taskData: Omit<Task, 'id' | 'createdAt'>): void {
    const newTask: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: new Date(),
    };

    this.http.post<Task>(this.apiUrl, newTask).subscribe({
      next: (createdTask) => {
        this.tasksSignal.update(tasks => [...tasks, createdTask]);
        console.log(`Created task: ${createdTask.title}`);
      },
      error: (error) => console.error('Error creating task:', error),
    });
  }

  updateTask(id: string, updates: Partial<Task>): void {
    this.http.patch<Task>(`${this.apiUrl}/${id}`, updates).subscribe({
      next: (updatedTask) => {
        this.tasksSignal.update(tasks =>
          tasks.map(t => (t.id === id ? updatedTask : t))
        );
        console.log(`Updated task: ${updatedTask.title}`);
      },
      error: (error) => console.error('Error updating task:', error),
    });
  }

  deleteTask(id: string): void {
    if (!this.authService.isManager()) {
      console.warn('Only managers can delete tasks!');
      return;
    }

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.tasksSignal.update(tasks => tasks.filter(t => t.id !== id));
        console.log(`Deleted task: ${id}`);
      },
      error: (error) => console.error('Error deleting task:', error),
    });
  }

  updateTaskStatus(id: string, newStatus: Task['status']): void {
    this.updateTask(id, { status: newStatus });
  }

  getTaskStats(): TaskStats {
    const tasks = this.tasks();
    const now = new Date();
    
    return {
      total: tasks.length,
      notStarted: tasks.filter(t => t.status === 'Not Started').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      overdue: tasks.filter(t => 
        t.status !== 'Completed' && new Date(t.dueDate) < now
      ).length,
      highPriority: tasks.filter(t => t.priority === 'high').length,
    };
  }

  getOverdueTasks(): Task[] {
    const now = new Date();
    return this.tasks().filter(t => 
      t.status !== 'Completed' && new Date(t.dueDate) < now
    );
  }

  private generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}