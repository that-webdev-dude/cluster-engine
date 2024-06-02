import { Engine } from "./Engine";
import { Display } from "./Display";
import { Assets } from "./Assets";
import { Scene } from "./Scene";

export class Game {
  private _scenes: Map<string, Scene> = new Map();
  private _engine: Engine;
  private _display: Display;
  private _scene: Scene;

  constructor() {
    this._scene = new Scene("default");
    this._engine = new Engine();
    this._display = new Display({
      parentElementId: "#app",
      width: 832,
      height: 640,
    });

    this._initialize();
  }

  private _initialize() {
    let appElement = document.querySelector("#app") as HTMLElement;
    if (!appElement) {
      throw new Error("[Game.ts:_initialize] Failed to get app element");
    } else {
      appElement.appendChild(this._display.view);
    }
  }

  public get context(): CanvasRenderingContext2D {
    return this._display.context;
  }

  public addScene(scene: Scene): void {
    this._scenes.set(scene.name, scene);
    if (this._scenes.size === 1) {
      this._scene = scene;
    }
  }

  public getScene(name: string): Scene | null {
    if (this._scenes.has(name)) {
      return this._scenes.get(name) as Scene;
    }
    return null;
  }

  public setScene(name: string): void {
    if (this._scenes.has(name)) {
      this._scene = this._scenes.get(name) as Scene;
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
