import { Cluster } from "../../cluster/types/cluster.types";
import { Display } from "./Display";
import { Engine } from "./Engine";
import { Assets } from "./Assets";
import { Scene } from "./Scene";

// just give the Game a scene to update
// when chenging scene use setScene method

type GameOptions = {
  scenes?: Map<string, Cluster.Creator<Scene>>;
  height: number;
  width: number;
};

const DEFAULTS: GameOptions = {
  width: 640,
  height: 320,
};

export class Game {
  private _scenes: Map<string, Cluster.Creator<Scene>> = new Map();
  private _display: Display;
  private _engine: Engine;
  private _scene: Scene;

  constructor(options: GameOptions) {
    const { scenes, width, height } = { ...DEFAULTS, ...options };
    this._scenes = scenes || new Map();
    this._scene = new Scene();
    this._engine = new Engine();
    this._display = new Display({
      parentElementId: "#app",
      width,
      height,
    });
  }

  public setScene(string: string): void {
    const scene = this._scenes.get(string);
    if (scene) {
      this._scene = scene();
    }
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
