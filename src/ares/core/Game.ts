import Input from "../input/Input";
import Engine from "../engine/Engine";
import Renderer from "../renderer/Renderer";
import Container from "./Container";

interface GameOptions {
  title?: string;
  width?: number;
  height?: number;
  version?: string;
}

class Game {
  readonly version: string;
  readonly title: string;
  readonly input: Input;
  readonly scene: Container;
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
    this.scene = new Container();
    this.input = new Input();
    this._engine = new Engine();
    this._renderer = new Renderer({ width, height });

    this._init();
  }

  private _init() {
    let appElement = document.querySelector("#app");
    if (!appElement) {
      throw new Error("Failed to get app element");
    } else {
      appElement.appendChild(this._renderer.view);
    }
  }

  public setScene(scene: Container, transitionDuration: number = 0) {}

  public start() {
    this._engine.update = (dt: number, t: number) => {
      this.scene.update(dt, t);
    };
    this._engine.render = () => {
      this._renderer.render(this.scene);
    };
    this._engine.start(); // start the engine
  }

  public stop() {
    this._engine.stop(); // stop the engine
  }
}

export default Game;
