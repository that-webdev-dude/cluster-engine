class Sprite {
  constructor(texture) {
    this.texture = texture;
    this.position = { x: 0, y: 0 };
    this.anchor = { x: 0, y: 0 };
    this.scale = { x: 1, y: 1 };
    this.pivot = { x: 0, y: 0 };
    this.angle = 0;
  }
}

export default Sprite;
