import { Cluster } from "../cluster/types/cluster.types";
import { Container, Scene, Entity, System, Vector } from "../cluster";
import { Components } from "../cluster/ecs";
import { Systems } from "../cluster/ecs";
import { store } from "../store/store";

class Background extends Entity {
  constructor() {
    super("background");

    // transform:
    this.attachComponent(
      new Components.Transform({
        position: new Vector(),
      })
    );
    // size:
    this.attachComponent(
      new Components.Size({
        width: store.get("width"),
        height: store.get("height"),
      })
    );
    // colour:
    this.attachComponent(
      new Components.Colour({
        fill: "red",
      })
    );
  }
}
class Title extends Entity {
  constructor() {
    super("title");

    // transform:
    this.attachComponent(
      new Components.Transform({
        position: new Vector(store.get("width") / 2, store.get("height") / 2),
      })
    );
    // text:
    this.attachComponent(
      new Components.Text({
        string: "playing...",
        font: "16px 'Press Start 2P'",
        align: "center",
      })
    );
    // colour:
    this.attachComponent(
      new Components.Colour({
        fill: "white",
      })
    );
  }
}

export class GameScene2 extends Scene {
  constructor() {
    const entities = new Container<Entity>();
    entities.add(new Background());
    entities.add(new Title());

    const systems = new Container<System>();
    systems.add(new Systems.Render(entities));

    super({
      name: "gameScene1",
      entities,
      systems,
      store,
    });

    console.log("GameScene2 created.");
  }
}

export const createGameScene2 = (): Cluster.Creator<Scene> => {
  return () => new GameScene2();
};
