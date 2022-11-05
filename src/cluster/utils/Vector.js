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
   * vector magnitude
   */
  get magnitude() {
    const { x, y } = this;
    return Math.sqrt(x * x + y * y);
  }

  /**
   * setting x, y in one go
   * @param {Number} x
   * @param {Number} y
   * @returns this
   */
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * copy the x, y props of the passed vector
   * @param {{x: Number, y: Number}} vector
   * @returns this
   */
  copy({ x, y }) {
    return this.set(x, y);
  }

  /**
   * adds to this vector
   * the vector (object with x, y)
   * passed in as parameter
   * @param {{x: Number, y: Number}} param0
   * @returns this
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
   * @returns this
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
   * @returns this
   */
  multiply(scalar = 1) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * alias to multiply()
   * scale this vector
   * by a scalar passed in as parameter
   * @param {Number} scalar
   * @returns this
   */
  scale(scalar = 1) {
    return this.multiply(scalar);
  }

  /**
   * reverse the vector components
   * by applying a scalar of -1
   * @returns this
   */
  reverse() {
    return this.scale(-1);
  }

  /**
   * normalize this vector
   * @returns this
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
   * alias to normalize()
   * normalize this vector
   * @returns this
   */
  unit() {
    return this.normalize();
  }

  /**
   * computes the dot product between
   * this vector and another vector
   * passed in as parameter
   * @param {{x: Number, y: Number}} param0
   * @returns number
   */
  dot({ x, y }) {
    return this.x * x + this.y * y;
  }

  /**
   * cross product
   * negative if this gets to param faster clockwise
   * positive if this gets to param faster counterclockwise
   * @param {{x: Number, y: Number}} param0
   * @returns number
   */
  cross({ x, y }) {
    return this.x * y - this.y * x;
  }

  /**
   * computes the angle in radians
   * between this & param
   * formula: θ = cos-1 [ (a · b) / (|a| |b|) ]
   * @param {*} param0
   * @returns
   */
  angleTo({ x, y }) {
    const refVector = new Vector(x, y);
    return Math.acos(this.dot(refVector) / (this.magnitude * refVector.magnitude));
  }

  /**
   * returns the normal
   * direction to this vector
   * @returns Vector
   */
  normal() {
    let x = -this.y;
    let y = this.x;
    return this.set(x, y).unit();
  }

  /**
   * clone this vector
   * and returns a new instance of it
   * @returns Vector
   */
  clone() {
    return Vector.from(this);
  }

  /**
   * distance vector between
   * this vector and the {x,y} vector
   * passed in as parameter
   * @param {*} param0
   * @returns Vector
   */
  distance({ x, y }) {
    return Vector.from(this).subtract({ x, y }).reverse();
  }

  /**
   * alias to distance()
   * distance vector between
   * this vector and the {x,y} vector
   * passed in as parameter
   * @param {*} param0
   * @returns Vector
   */
  to({ x, y }) {
    // return this.clone().subtract({ x, y }).reverse();
    return Vector.from(this).subtract({ x, y }).reverse();
  }
}

export default Vector;
