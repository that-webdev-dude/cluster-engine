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
  private engine: Engine;
  private renderer: Renderer;

  constructor(options: GameOptions = {}) {
    this.version = options.version ?? "1.0.0";
    this.title = options.title ?? "Game";
    this.scene = new Container();
    this.input = new Input();
    this.engine = new Engine();
    this.renderer = new Renderer();
  }

  setScene(scene: Container, transitionDuration: number = 0) {}

  run(onUpdate: () => {}) {}
}

export default Game;
