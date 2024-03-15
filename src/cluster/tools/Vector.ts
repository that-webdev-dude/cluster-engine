export class Vector {
  private _x: number;
  private _y: number;
  private _magnitude: number | null;

  // static methods
  static from({ x, y }: Vector | { x: number; y: number }): Vector {
    return new Vector(x, y);
  }

  static dot(v1: Vector, v2: Vector): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  static cross(v1: Vector, v2: Vector): number {
    return v1.x * v2.y - v1.y * v2.x;
  }

  static clone(v: Vector): Vector {
    return Vector.from(v);
  }

  static connect(v1: Vector, v2: Vector): Vector {
    return Vector.from(v1).subtract(v2).reverse();
  }

  static distanceBetween(v1: Vector, v2: Vector): number {
    return Vector.from(v1).subtract(v2).reverse().magnitude;
  }

  static angleBetween(v1: Vector, v2: Vector): number {
    const dotProduct = this.dot(v1, v2);
    const magnitudeProduct = v1.magnitude * v2.magnitude;
    return Math.acos(dotProduct / magnitudeProduct);
  }

  static normal(v1: Vector): Vector {
    let x = -v1.y;
    let y = v1.x;
    return v1.set(x, y).unit();
  }

  static direction(v1: Vector) {
    return Vector.from(v1).unit();
  }

  // instance
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

  public set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  public copy({ x, y }: Vector): this {
    return this.set(x, y);
  }

  public add({ x, y }: Vector): this {
    this.x += x;
    this.y += y;
    return this;
  }

  public subtract({ x, y }: Vector): this {
    this.x -= x;
    this.y -= y;
    return this;
  }

  public multiply({ x, y }: Vector): this {
    this.x *= x;
    this.y *= y;
    return this;
  }

  public scale(scalar: number = 1): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  public swap(): this {
    let x = this.x;
    this.x = this.y;
    this.y = x;
    return this;
  }

  public reverse(): this {
    return this.scale(-1);
  }

  public normalize(): this {
    let magnitude = this.magnitude;
    if (magnitude > 0) {
      this.x /= magnitude;
      this.y /= magnitude;
    }
    return this;
  }

  public unit(): this {
    return this.normalize();
  }
}
