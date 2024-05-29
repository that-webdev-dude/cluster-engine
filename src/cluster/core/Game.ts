import { Engine } from "./Engine";
import { Display } from "./Display";
import { Assets } from "./Assets";

export class Game {
  private _engine: Engine;
  private _display: Display;

  constructor() {
    this._engine = new Engine();
    this._display = new Display({
      parentElementId: "#app",
      width: 832,
      height: 640,
    });

    this._init();
  }

  private _init() {
    let appElement = document.querySelector("#app") as HTMLElement;
    if (!appElement) {
      throw new Error("[Game.ts:_init] Failed to get app element");
    } else {
      appElement.appendChild(this._display.view);
    }
  }

  public get display(): Display {
    return this._display;
  }

  public start(updateCb: (dt: number, t: number) => void = () => {}): void {
    this._engine.update = (dt: number, t: number) => {
      // ...
      updateCb(dt, t);
    };
    // this._engine.render = () => {
    //   // ...
    // };
    Assets.onReady(() => {
      this._engine.start(); // start the engine
    });
  }

  public stop() {
    this._engine.stop(); // stop the engine
  }
}
