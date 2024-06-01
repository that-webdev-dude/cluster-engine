import { Game, Container, System, Vector } from "./cluster";
import { Rect } from "./entities/Rect";
import { Circle } from "./entities/Circle";
import { RenderSystem } from "./systems/RenderSystem";

class World extends Container {
  private _systems: System[] = [];
  constructor() {
    super();
  }
  addSystem(system: System) {
    this._systems.push(system);
  }
  update(dt: number, t: number) {
    this._systems.forEach((system) => {
      system.update(dt, t);
    });
  }
}

const game = new Game();
const rect = new Rect({
  position: new Vector(100, 100),
  width: 100,
  height: 100,
  style: {
    fill: "lightblue",
    stroke: "transparent",
  },
});

const circle = new Circle({
  position: new Vector(200, 200),
  radius: 50,
  style: {
    fill: "transparent",
    stroke: "black",
  },
});

const world = new World();
world.addEntity(rect);
world.addEntity(circle);
world.addSystem(new RenderSystem(game.display.context, world));

export default () => {
  game.start((dt, t) => {
    world.update(dt, t);
  });
};

type SystemFunction = (container: Container, ...args: any[]) => void;

const system1: SystemFunction = (
  container: Container,
  context: CanvasRenderingContext2D
) => {
  console.log(container, context);
};
