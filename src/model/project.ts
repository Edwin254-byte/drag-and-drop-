//status enum
export enum projectStatus {
  active,
  finished,
}
//project class
export class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: projectStatus
  ) {}
}

//custom function type for listeners
export type Listener<T> = (items: T[]) => void;
