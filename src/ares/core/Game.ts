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

  constructor(options: GameOptions = {}) {
    this.version = options.version ?? "1.0.0";
    this.title = options.title ?? "Game";
    this.scene = new Container();
    this.input = new Input();
    this._engine = new Engine();
    this._renderer = new Renderer();
  }

  setScene(scene: Container, transitionDuration: number = 0) {}

  start() {
    this._engine.update = (dt: number, t: number) => {
      this.scene.update(dt, t);
    };
    this._engine.render = () => {
      this._renderer.render(this.scene);
    };
    this._engine.start(); // start the engine
  }

  stop() {
    this._engine.stop(); // stop the engine
  }
}

export default Game;
