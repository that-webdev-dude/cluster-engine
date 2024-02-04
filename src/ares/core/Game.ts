import KeyboardInput from "../input/Keyboard";
import GamepadInput from "../input/Gamepad";
import MouseInput from "../input/Mouse";
import Renderer from "../renderer/Renderer";
import Engine from "../engine/Engine";
import Assets from "./Assets";
import Container from "./Container";

type GameOptions = {
  title?: string;
  width?: number;
  height?: number;
  version?: string;
};

class Game {
  readonly version: string;
  readonly title: string;
  private _scene: Container;
  private _engine: Engine;
  private _renderer: Renderer;
  private _mouseInput: MouseInput;
  private _gamepadInput: GamepadInput;
  private _keyboardInput: KeyboardInput;

  constructor({
    title = "Game",
    width = 832,
    height = 640,
    version = "1.0.0",
  }: GameOptions = {}) {
    this.version = version;
    this.title = title;
    this._scene = new Container();
    this._engine = new Engine();
    this._renderer = new Renderer({ width, height });
    this._mouseInput = new MouseInput(this._renderer.view);
    this._gamepadInput = new GamepadInput();
    this._keyboardInput = new KeyboardInput();
    this._init();
  }

  private _init() {
    let appElement = document.querySelector("#app") as HTMLElement;
    if (!appElement) {
      throw new Error("[Game.ts:_init] Failed to get app element");
    } else {
      appElement.appendChild(this._renderer.view);
    }
  }

  get width(): number {
    return this._renderer.width;
  }

  get height(): number {
    return this._renderer.height;
  }

  get scene(): Container {
    return this._scene;
  }

  get mouse(): MouseInput {
    return this._mouseInput;
  }

  get gamepad(): GamepadInput {
    return this._gamepadInput;
  }

  get keyboard(): KeyboardInput {
    return this._keyboardInput;
  }

  // TODO: Add screen transition
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
    Assets.onReady(() => {
      this._engine.start(); // start the engine
    });
  }

  public stop() {
    this._engine.stop(); // stop the engine
  }
}

export default Game;
