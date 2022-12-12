import Assets from "./Assets";

class Texture {
  constructor(url) {
    // this.img = new Image();
    // this.img.src = url;
    this.img = Assets.image(url);
  }

  get width() {
    return this.img.width;
  }

  get height() {
    return this.img.height;
  }
}

export default Texture;
