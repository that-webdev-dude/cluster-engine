import { DebugRect } from "../entities/_Debug";
import { store } from "../store";
import * as Cluster from "../../cluster";
import * as Entities from "../entities";
import * as Systems from "../systems";

export class GamePlay extends Cluster.Scene {
  private _game: Cluster.Game;

  constructor(game: Cluster.Game) {
    super();

    this._game = game;

    // entities
    // for (let i = 0; i < 10; i++) {
    //   this.addEntity(new Entities.Star());
    // }
    // this.addEntity(new Entities.Background());
    // this.addEntity(new Entities.Spaceship());
    // this.addEntity(new Entities.Mothership());
    // this.addEntity(new Entities.UIScores());
    // this.addEntity(new Entities.UILives());
    // just the background, spaceship and debugRect forming a cave to test collisions
    this.addEntity(new Entities.Background());
    this.addEntity(new Entities.Spaceship());
    for (let i = 0; i < 10; i++) {
      this.addEntity(
        new DebugRect(
          new Cluster.Vector(
            Cluster.Cmath.rand(0, 500),
            Cluster.Cmath.rand(0, 500)
          )
        )
      );
    }

    // systems
    this.addSystem(new Systems.InputSystem());
    this.addSystem(new Systems.MotionSystem());
    this.addSystem(new Systems.SpawnSystem());
    this.addSystem(new Systems.BoundarySystem());
    this.addSystem(new Systems.CollisionSystem());
    this.addSystem(new Systems.RendererSystem());

    // listeners
    store.on("lives-changed", () => {
      this.addEntity(new Entities.Spaceship());
    });
  }
}

export class GameTitle extends Cluster.Scene {
  private _game: Cluster.Game;

  constructor(game: Cluster.Game) {
    super();

    this._game = game;

    for (let i = 0; i < 10; i++) {
      this.addEntity(new Entities.Star());
    }
    this.addEntity(new Entities.Background());
    this.addEntity(new Entities.UITitle());

    this.addSystem(new Systems.MotionSystem());
    this.addSystem(new Systems.BoundarySystem());
    this.addSystem(new Systems.RendererSystem());
  }

  update(dt: number, t: number) {
    if (Cluster.Keyboard.key("Enter")) {
      store.dispatch("resetGame");
      this._game.setScene(new GamePlay(this._game));
    }

    super.update(dt, t);
  }
}
