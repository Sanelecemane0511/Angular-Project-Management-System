import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly apiUrl = 'api/projects';

  //FIXED: Adding the missing signal property
  private projectsSignal = signal<Project[]>([]);
  projects = computed(() => this.projectsSignal());

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadProjects();
  }

  loadProjects(): void {
    this.http.get<Project[]>(this.apiUrl).subscribe({
      next: (projects) => {
        this.projectsSignal.set(projects);
        console.log(`Loaded ${projects.length} projects`);
      },
      error: (error) => console.error('Error loading projects:', error),
    });
  }

  getProject(id: string): Observable<Project | undefined> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(projectData: Omit<Project, 'id' | 'createdAt'>): void {
    const newProject: Project = {
      ...projectData,
      id: this.generateId(),
      createdAt: new Date(),
    };

    this.http.post<Project>(this.apiUrl, newProject).subscribe({
      next: (createdProject) => {
        this.projectsSignal.update(projects => [...projects, createdProject]);
        console.log(`Created project: ${createdProject.title}`);
      },
      error: (error) => console.error('Error creating project:', error),
    });
  }

  updateProject(id: string, updates: Partial<Project>): void {
    this.http.patch<Project>(`${this.apiUrl}/${id}`, updates).subscribe({
      next: (updatedProject) => {
        this.projectsSignal.update(projects =>
          projects.map((p: Project) => (p.id === id ? updatedProject : p))
        );
        console.log(`Updated project: ${updatedProject.title}`);
      },
      error: (error) => console.error('Error updating project:', error),
    });
  }

  deleteProject(id: string): void {
    if (!this.authService.isManager()) {
      console.warn('Only managers can delete projects');
      return;
    }

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.projectsSignal.update(projects => projects.filter((p: Project) => p.id !== id));
        console.log(`Deleted project: ${id}`);
      },
      error: (error) => console.error('Error deleting project:', error),
    });
  }

  canManageProject(project: Project): boolean {
    return this.authService.isManager() || 
           project.managerId === this.authService.currentUser()?.id;
  }

  // ADDED: Project tracking
  private currentProjectSignal = signal<Project | null>(null);
  currentProject = computed(() => this.currentProjectSignal());

  setCurrentProject(project: Project): void {
    this.currentProjectSignal.set(project);
  }

  clearCurrentProject(): void {
    this.currentProjectSignal.set(null);
  }

  // ADDED: Team validation
  validateTeam(project: Project): boolean {
    if (!project.teamMembers || project.teamMembers.length === 0) {
      console.warn('No team members assigned');
      return false;
    }
    
    if (project.teamMembers.length > project.maxTeamSize) {
      console.warn(`Team size ${project.teamMembers.length} exceeds maximum ${project.maxTeamSize}`);
      return false;
    }
    
    const memberIds = project.teamMembers.map(m => m.id);
    const uniqueIds = new Set(memberIds);
    if (uniqueIds.size !== memberIds.length) {
      console.warn('Duplicate team members detected');
      return false;
    }
    
    return true;
  }

  private generateId(): string {
    return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}