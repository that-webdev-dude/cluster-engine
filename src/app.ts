import { Game, Container, Entity, System } from "./x";
import { Rect } from "./xentities/Rect";
import { Circle } from "./xentities/Circle";
import { Transform } from "./xcomponents/Transform";
import { Size } from "./xcomponents/Size";

class World extends Container {
  private _systems: Function[] = [];
  constructor() {
    super();
  }

  registerSystem(system: Function) {
    this._systems.push(system);
  }

  update() {
    this._systems.forEach((system) => {
      system(this);
    });
  }
}

const renderRect = (
  context: CanvasRenderingContext2D,
  container: Container
) => {
  const entities = container.getEntitiesWith(["Transform", "Size"]);
  entities.forEach((entity: Entity) => {
    // const { position } = entity.getComponent("Transform") as Transform;
    // const { width, height } = entity.getComponent("Size") as Size;
    // context.fillStyle = "red";
    // context.fillRect(position.x, position.y, width, height);
  });
};

const world = new World();

const rect = new Rect();

const circle = new Circle();

world.addEntity(rect);
world.addEntity(circle);
world.registerSystem(() => {
  renderRect(game.display.context, world);
});

const game = new Game();

export default () => {
  game.start(() => {
    world.update();
  });
};
