import Assets from "./Assets";

class Texture {
  private _img: HTMLImageElement;

  constructor(url: string) {
    this._img = Assets.image(url);
  }

  get width() {
    return this._img.width;
  }

  get height() {
    return this._img.height;
  }
}

export default Texture;
