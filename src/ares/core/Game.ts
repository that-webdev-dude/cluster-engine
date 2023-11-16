import { KeyboardInput, MouseInput } from "../input";
import Engine from "../engine/Engine";
import Renderer from "../renderer/Renderer";
import Container from "./Container";

interface GameOptions {
  title?: string;
  width?: number;
  height?: number;
  version?: string;
}

type Input = {
  readonly mouse: MouseInput;
  readonly keyboard: KeyboardInput;
};

class Game {
  readonly version: string;
  readonly title: string;
  readonly input: Input;
  private _scene: Container;
  private _engine: Engine;
  private _renderer: Renderer;

  constructor({
    title = "Game",
    width = 832,
    height = 640,
    version = "1.0.0",
  }: GameOptions = {}) {
    this.version = version;
    this.title = title;
    this.input = {
      mouse: new MouseInput(),
      keyboard: new KeyboardInput(),
    };
    this._scene = new Container();
    this._engine = new Engine();
    this._renderer = new Renderer({ width, height });

    this._init();
  }

  get width(): number {
    return this._renderer.width;
  }

  get height(): number {
    return this._renderer.height;
  }

  private _init() {
    let appElement = document.querySelector("#app");
    if (!appElement) {
      throw new Error("Failed to get app element");
    } else {
      appElement.appendChild(this._renderer.view);
    }
  }

  public setScene(scene: Container, transitionDuration: number = 0) {
    this._scene = scene;
  }

  public start(updateCb: (dt: number, t: number) => void = () => {}): void {
    this._engine.update = (dt: number, t: number) => {
      this._scene.update(dt, t);
      updateCb(dt, t);
    };
    this._engine.render = () => {
      this._renderer.render(this._scene);
    };
    this._engine.start(); // start the engine
  }

  public stop() {
    this._engine.stop(); // stop the engine
  }
}

export default Game;
