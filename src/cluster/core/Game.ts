import { Display } from "./Display";
import { Engine } from "./Engine";
import { Assets } from "./Assets";
import { Scene } from "./ECS";

// just give the Game a scene to update
// when chenging scene use setScene method

type GameOptions = {
  height: number;
  width: number;
};

const DEFAULTS: GameOptions = {
  width: 640,
  height: 320,
};

export class Game {
  private _display: Display;
  private _engine: Engine;
  private _scene: Scene | null = null;

  constructor(options: GameOptions) {
    const { width, height } = { ...DEFAULTS, ...options };
    this._scene = null;
    this._engine = new Engine();
    this._display = new Display({
      parentElementId: "#app",
      width,
      height,
    });
  }

  public setScene(scene: Scene): void {
    this._scene = scene;
  }

  public start(updateCb: (dt: number, t: number) => void = () => {}): void {
    this._engine.update = (dt: number, t: number) => {
      if (!this._scene) return;
      this._scene.update(dt, t);
      updateCb(dt, t);
    };

    Assets.onReady(() => {
      this._engine.start(); // start the engine
    });
  }

  public stop() {
    this._engine.stop(); // stop the engine
  }
}
