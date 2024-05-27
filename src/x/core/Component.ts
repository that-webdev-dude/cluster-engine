export class Component {
  readonly type: string = this.constructor.name;
  readonly entity: string;

  constructor(entity: string) {
    this.entity = entity;
  }
}
