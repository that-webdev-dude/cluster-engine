class Texture {
  constructor(url) {
    this.img = new Image();
    this.img.src = url;
  }

  get width() {
    return this.img.width;
  }

  get height() {
    return this.img.height;
  }
}

export default Texture;
