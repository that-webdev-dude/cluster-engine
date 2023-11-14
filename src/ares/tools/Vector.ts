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

  public multiply(scalar: number = 1): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  public scale(scalar: number = 1): this {
    return this.multiply(scalar);
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

  public dot({ x, y }: Vector): number {
    return this.x * x + this.y * y;
  }

  public cross({ x, y }: Vector): number {
    return this.x * y - this.y * x;
  }

  public angleTo({ x, y }: Vector): number {
    const dotProduct = this.x * x + this.y * y;
    const magnitudeProduct = this.magnitude * Math.sqrt(x * x + y * y);
    return Math.acos(dotProduct / magnitudeProduct);
  }

  public normal(): Vector {
    let x = -this.y;
    let y = this.x;
    return this.set(x, y).unit();
  }

  public clone(): Vector {
    return Vector.from(this);
  }

  public distance(vector: Vector): Vector {
    return Vector.from(this).subtract(vector).reverse();
  }

  public to(vector: Vector): Vector {
    return Vector.from(this).subtract(vector).reverse();
  }
}

export default Vector;
