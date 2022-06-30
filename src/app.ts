//implementing drag and drop feature using contact interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}
interface DropTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}
//status enum
enum projectStatus {
  active,
  finished,
}
//project class
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: projectStatus
  ) {}
}

//custom function type for listeners
type Listener<T> = (items: T[]) => void;

class state<T> {
  protected listeners: Listener<T>[] = [];
  addListener(listenerFuntion: Listener<T>) {
    this.listeners.push(listenerFuntion);
  }
}
//project state class
class ProjectState extends state<Project> {
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
const projectState = ProjectState.getInstance();

//Validate interface
interface Validate {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validate) {
  let isValid = true;
  if (validatableInput.required) {
    isValid &&= validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid &&= validatableInput.value.length > validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid &&= validatableInput.value.length < validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid &&= validatableInput.value > validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid &&= validatableInput.value < validatableInput.max;
  }

  return isValid;
}
// autobind method Decorator
function AutoBind(_: any, _2: string, description: PropertyDescriptor) {
  const curMethod = description.value;
  const newDescription: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      return curMethod.bind(this);
    },
  };
  return newDescription;
}
//Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  inputTemplate: HTMLTemplateElement;
  outputContainer: T;
  element: U;
  constructor(
    templateId: string,
    outputContainerId: string,
    insertPosition: InsertPosition,
    newElementId?: string
  ) {
    this.inputTemplate = document.getElementById(
      templateId
    ) as HTMLTemplateElement;
    this.outputContainer = document.getElementById(outputContainerId) as T;
    const importedNode = document.importNode(this.inputTemplate.content, true);
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertPosition);
  }
  private attach(insertPosition: InsertPosition) {
    this.outputContainer.insertAdjacentElement(insertPosition, this.element);
  }
  abstract configure(): void;
  abstract renderContent(): void;
}

//Single Project Class
class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;
  get persons() {
    if (this.project.people === 1) return '1 person';
    return `${this.project.people} persons `;
  }
  constructor(hostId: string, project: Project) {
    super('single-project', hostId, 'beforeend', project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }
  @AutoBind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }
  dragEndHandler(_: DragEvent): void {
    console.log('End');
  }
  configure(): void {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }
  renderContent(): void {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons + 'assigned';
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

//Project List Class
class ProjectList
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

//Class Project Input
class ProjectForm extends Component<HTMLDivElement, HTMLFormElement> {
  inputTitleEl: HTMLInputElement;
  inputDescriptionEl: HTMLInputElement;
  inputPeopleEl: HTMLInputElement;
  constructor() {
    super('project-input', 'app', 'afterbegin', 'user-input');
    this.inputTitleEl = this.element.querySelector(
      '#title'
    ) as HTMLInputElement;
    this.inputDescriptionEl = this.element.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.inputPeopleEl = this.element.querySelector(
      '#people'
    ) as HTMLInputElement;
    this.configure();
  }
  configure() {
    this.element.addEventListener('submit', this.formHandler);
  }
  renderContent(): void {}

  private collectUserInput(): [string, string, number] | void {
    const title = this.inputTitleEl.value;
    const description = this.inputDescriptionEl.value;
    const people = this.inputPeopleEl.value;
    /* function isEmpty(data: string): boolean {
      if (data.trim().length === 0) return true;
      else return false;
    } */
    const titleValidatable: Validate = {
      value: title,
      required: true,
    };
    const descriptionValidatable: Validate = {
      value: description,
      required: true,
      minLength: 5,
      maxLength: 250,
    };
    const peopleValidatable: Validate = {
      value: +people,
      required: true,
      min: 1,
      max: 30,
    };
    if (
      validate(titleValidatable) &&
      validate(descriptionValidatable) &&
      validate(peopleValidatable)
    ) {
      return [title, description, +people];
    }
    alert('An error occurred!!!');
    return;
  }

  private clearInputs() {
    this.inputTitleEl.value = '';
    this.inputDescriptionEl.value = '';
    this.inputPeopleEl.value = '';
    this.inputPeopleEl.blur();
  }
  //method decorator for binding this keyword
  @AutoBind
  private formHandler(e: Event) {
    e.preventDefault();
    const userInput = this.collectUserInput();
    if (Array.isArray(userInput)) {
      //console.log(userInput);
      const [title, description, people] = userInput;
      projectState.addProject(title, description, people);
    }
    this.clearInputs();
  }
}

const p1 = new ProjectForm();
const activeProject = new ProjectList('active');
const finishedProject = new ProjectList('finished');
