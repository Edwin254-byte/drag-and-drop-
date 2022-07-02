import { Project, projectStatus } from '../model/project';
import { DropTarget } from '../model/drag-drop';
import { Component } from './base-component';
import { AutoBind } from '../decorators/autobind';
import { projectState } from '../state/project-state';
import { ProjectItem } from './project-item';
//Project List Class
export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DropTarget
{
  assignedProjects: Project[];
  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', 'beforeend', `${type}-projects`);

    this.assignedProjects = [];
    this.configure();
    this.renderContent();
  }
  private renderNewProject() {
    const listElement = document.getElementById(
      `${this.type}-projects-list`
    ) as HTMLUListElement;
    listElement.textContent = '';
    this.assignedProjects.forEach(
      project => new ProjectItem(this.element.querySelector('ul')!.id, project)
    );
  }
  //Drag and Drop methods
  @AutoBind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  }
  @AutoBind
  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      projectId,
      this.type === 'active' ? projectStatus.active : projectStatus.finished
    );
  }
  @AutoBind
  dragLeaveHandler(event: DragEvent): void {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }
  configure(): void {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('drop', this.dropHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(proj => {
        if (this.type === 'active') return proj.status === projectStatus.active;
        return proj.status === projectStatus.finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderNewProject();
    });
  }
  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector(
      'h2'
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }
}
