import { config } from "webpack";
import { Container } from "../ares";

interface IDialogConfig {
  width: number;
  height: number;
  onClose(): void;
  onUpdate(): void;
}

class Dialog extends Container {
  readonly width: number;
  readonly height: number;
  private _elapsed: number;
  private _onClose() {}
  private _onUpdate() {}

  constructor({
    width = 0,
    height = 0,
    onClose = () => {},
    onUpdate = () => {},
  }: IDialogConfig) {
    if (!width || !height)
      throw new Error("Dialog: width and height are required!");

    super();
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

export default Dialog;
