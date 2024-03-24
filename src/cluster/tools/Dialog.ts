import { Container } from "../core/Container";
import { Vector } from "./Vector";

type DialogConfig = {
  position: Vector;
  width: number;
  height: number;
  onClose(): void;
  onUpdate(): void;
};

export class Dialog extends Container {
  readonly width: number;
  readonly height: number;
  private _elapsed: number;
  private _onClose() {}
  private _onUpdate() {}

  constructor({
    position = new Vector(0, 0),
    width = 0,
    height = 0,
    onClose = () => {},
    onUpdate = () => {},
  }: DialogConfig) {
    if (!width || !height)
      throw new Error("Dialog: width and height are required!");

    super({ position });
    this.width = width;
    this.height = height;
    this._onClose = onClose;
    this._onUpdate = onUpdate;
    this._elapsed = 0;
  }

  get elapsed() {
    return this._elapsed;
  }

  close() {
    this._onClose();
  }

  update(dt: number, t: number) {
    this._elapsed += dt;
    this._onUpdate();
  }
}
