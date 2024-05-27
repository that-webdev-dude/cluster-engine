export class Component {
  readonly type: string = this.constructor.name;
  readonly id: string;

  constructor(entityId: string) {
    this.id = entityId;
  }
}
