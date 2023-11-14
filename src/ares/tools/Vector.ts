class Vector {
  private _x: number;
  private _y: number;
  private _magnitude: number | null;

  static from({ x, y }: Vector): Vector {
    return new Vector(x, y);
  }

  constructor(x: number = 0, y: number = 0) {
    this._x = x;
    this._y = y;
    this._magnitude = null;
  }

  get x(): number {
    return this._x;
  }

  set x(value: number) {
    this._x = value;
    this._magnitude = null;
  }

  get y(): number {
    return this._y;
  }

  set y(value: number) {
    this._y = value;
    this._magnitude = null;
  }

  get magnitude(): number {
    if (this._magnitude === null) {
      this._magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
    }
    return this._magnitude;
  }

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  copy({ x, y }: Vector): this {
    return this.set(x, y);
  }

  add({ x, y }: Vector): this {
    this.x += x;
    this.y += y;
    return this;
  }

  subtract({ x, y }: Vector): this {
    this.x -= x;
    this.y -= y;
    return this;
  }

  multiply(scalar: number = 1): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  scale(scalar: number = 1): this {
    return this.multiply(scalar);
  }

  reverse(): this {
    return this.scale(-1);
  }

  normalize(): this {
    let magnitude = this.magnitude;
    if (magnitude > 0) {
      this.x /= magnitude;
      this.y /= magnitude;
    }
    return this;
  }

  unit(): this {
    return this.normalize();
  }

  dot({ x, y }: Vector): number {
    return this.x * x + this.y * y;
  }

  cross({ x, y }: Vector): number {
    return this.x * y - this.y * x;
  }

  angleTo({ x, y }: Vector): number {
    const dotProduct = this.x * x + this.y * y;
    const magnitudeProduct = this.magnitude * Math.sqrt(x * x + y * y);
    return Math.acos(dotProduct / magnitudeProduct);
  }

  normal(): Vector {
    let x = -this.y;
    let y = this.x;
    return this.set(x, y).unit();
  }

  clone(): Vector {
    return Vector.from(this);
  }

  distance(vector: Vector): Vector {
    return Vector.from(this).subtract(vector).reverse();
  }

  to(vector: Vector): Vector {
    return Vector.from(this).subtract(vector).reverse();
  }
}

export default Vector;
