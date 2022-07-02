import { Listener, Project, projectStatus } from '../model/project';
//state class
class state<T> {
  protected listeners: Listener<T>[] = [];
  addListener(listenerFuntion: Listener<T>) {
    this.listeners.push(listenerFuntion);
  }
}
//project state class
export class ProjectState extends state<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }
  //singleton pattern
  static getInstance() {
    if (this.instance) return this.instance;
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toFixed(5),
      title,
      description,
      people,
      projectStatus.active
    );
    this.projects.push(newProject);
    //Adding the listeners to all projects (copy)
    this.updateListeners();
  }
  moveProject(projectId: string, newStatus: projectStatus) {
    const project = this.projects.find(project => project.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }
  updateListeners() {
    this.listeners.forEach(listenerFn => listenerFn(this.projects.slice()));
  }
}
//implementing singleton
export const projectState = ProjectState.getInstance();
