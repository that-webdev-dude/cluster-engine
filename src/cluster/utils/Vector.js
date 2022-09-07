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
   * @param {{x: Number, y: Number}} param0
   * @returns this vector instance
   */
  copy({ x, y }) {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * clone this vector
   * and returns a new instance of it
   * @param {{x: Number, y: Number}} param0
   * @returns this vector instance
   */
  clone() {
    return Vector.from(this);
  }

  /**
   * adds to this vector
   * the vector (object with x, y)
   * passed in as parameter
   * @param {{x: Number, y: Number}} param0
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
   * @param {{x: Number, y: Number}} param0
   * @returns this vector instance
   */
  subtract({ x, y }) {
    this.x -= x;
    this.y -= y;
    return this;
  }

  /**
   * scale this vector
   * by a scalar passed in as parameter
   * @param {Number} scalar
   * @returns this vector instance
   */
  scale(scalar = 1) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * alias to scale()
   * scale this vector
   * by a scalar passed in as parameter
   * @param {Number} scalar
   * @returns this vector instance
   */
  multiply(scalar = 1) {
    return this.scale(scalar);
  }

  /**
   * normalize this vector
   * @returns this vector instance
   */
  normalize() {
    let magnitude = this.magnitude;
    if (magnitude > 0) {
      this.x /= magnitude;
      this.y /= magnitude;
    }
    return this;
  }

  /**
   * computes the dot product between
   * this vector and another vector
   * passed in as parameter
   * @param {{x: Number, y: Number}} param0
   * @returns the dot product
   */
  dot({ x, y }) {
    return this.x * x + this.y * y;
  }
}

export default Vector;
