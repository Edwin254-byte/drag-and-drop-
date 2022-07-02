import { Component } from './base-component';
import { validate, Validate } from '../util/validation';
import { AutoBind } from '../decorators/autobind';
import { projectState } from '../state/project-state';
//Class Project Input
export class ProjectForm extends Component<HTMLDivElement, HTMLFormElement> {
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
