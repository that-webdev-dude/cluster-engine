import { Entity, Component, System, Scene } from "./cluster/core/ECS";
import { Game } from "./cluster/core/Game";

// Example Components
class Position extends Component {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }
}

class Velocity extends Component {
  dx: number;
  dy: number;
  constructor(dx: number, dy: number) {
    super();
    this.dx = dx;
    this.dy = dy;
  }
}

// Example System
class MovementSystem extends System {
  constructor() {
    super(["Position", "Velocity"]);
  }

  update(entities: Set<Entity>) {
    for (let entity of entities) {
      const position = entity.components.get("Position") as Position;
      const velocity = entity.components.get("Velocity") as Velocity;
      position.x += velocity.dx;
      position.y += velocity.dy;
    }
  }
}

// Usage Example
const scene = new Scene();

const entity1 = new Entity(1);
entity1.addComponent(new Position(0, 0));
entity1.addComponent(new Velocity(1, 1));

const entity2 = new Entity(2);
entity2.addComponent(new Position(10, 10));
entity2.addComponent(new Velocity(2, 2));

scene.addEntity(entity1);
scene.addEntity(entity2);

const movementSystem = new MovementSystem();
scene.addSystem(movementSystem);

const game = new Game({ width: 640, height: 320 });
game.setScene(scene);

export default () => {
  game.start();
};
