//Component Base Class
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
