class Vector {
  static from(v) {
    return new Vector().copy(v);
  }

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * computed
   * vector magniture
   */
  get magnitude() {
    const { x, y } = this;
    return Math.sqrt(x * x + y * y);
  }

  /**
   * setting x, y in one go
   * @param {Number} x
   * @param {Number} y
   * @returns this vector instance
   */
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * copy the x, y props of the passed object
   * @param {{X: Number, y: Number}} param0
   * @returns this vector instance
   */
  copy({ x, y }) {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * adds to this vector
   * the vector (object with x, y)
   * passed in as parameter
   * @param {{X: Number, y: Number}} param0
   * @returns this vector instance
   */
  add({ x, y }) {
    this.x += x;
    this.y += y;
    return this;
  }

  /**
   * subtract to this vector
   * the vector (object with x, y)
   * passed in as parameter
   * @param {{X: Number, y: Number}} param0
   * @returns this vector instance
   */
  subtract({ x, y }) {
    this.x -= x;
    this.y -= y;
    return this;
  }
}

export default Vector;
