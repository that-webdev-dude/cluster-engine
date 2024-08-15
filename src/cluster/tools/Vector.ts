// TODO
// - Add error handling where needed
// - Add unit tests
// - Accept a Vector or an object with x and y properties in all methods

export class Vector {
  private _x: number;
  private _y: number;
  private _magnitude: number | null;

  // Vector static methods

  /**
   * Creates a new Vector instance from the provided coordinates.
   * @param coordinates - The coordinates of the vector.
   * @returns A new Vector instance.
   */
  static from({ x, y }: Vector | { x: number; y: number }): Vector {
    return new Vector(x, y);
  }

  /**
   * Creates a new Vector instance with the provided coordinates.
   * @param x - The x coordinate of the vector.
   * @param y - The y coordinate of the vector.
   * @returns A new Vector instance.
   */
  static clone(v: Vector): Vector {
    return Vector.from(v);
  }

  /**
   * Adds two vectors together.
   * @param v1 - The first vector.
   * @param v2 - The second vector.
   * @returns A new Vector instance.
   */
  static add(v1: Vector, v2: Vector): Vector {
    return Vector.from(v1).add(v2);
  }

  /**
   * Subtracts the second vector from the first vector.
   * @param v1 - The first vector.
   * @param v2 - The second vector.
   * @returns A new Vector instance.
   */
  static subtract(v1: Vector, v2: Vector): Vector {
    return Vector.from(v1).subtract(v2);
  }

  /**
   * Multiplies two vectors together.
   * @param v1 - The first vector.
   * @param v2 - The second vector.
   * @returns A new Vector instance.
   */
  static multiply(v1: Vector, v2: Vector): Vector {
    return Vector.from(v1).multiply(v2);
  }

  /**
   * Scales a vector by a scalar.
   * @param v1 - The vector to scale.
   * @param scalar - The scalar to scale the vector by.
   * @returns A new Vector instance.
   */
  static scale(v1: Vector, scalar: number): Vector {
    return Vector.from(v1).scale(scalar);
  }

  /**
   * Rotates a vector around a pivot point by a given angle.
   * @param v1 - The vector to rotate.
   * @param pivot - The pivot point to rotate around.
   * @param angle - The angle to rotate the vector by.
   * @returns A new Vector instance.
   */
  static rotate(v1: Vector, pivot: Vector, angle: number): Vector {
    let x = v1.x - pivot.x;
    let y = v1.y - pivot.y;
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    let newX = x * cos - y * sin;
    let newY = x * sin + y * cos;
    return v1.set(newX + pivot.x, newY + pivot.y);
  }

  /**
   * Calculates the dot product of two vectors.
   * @param v1 - The first vector.
   * @param v2 - The second vector.
   * @returns The dot product of the two vectors.
   */
  static dot(v1: Vector, v2: Vector): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  /**
   * Calculates the cross product of two vectors.
   * @param v1 - The first vector.
   * @param v2 - The second vector.
   * @returns The cross product of the two vectors.
   */
  static cross(v1: Vector, v2: Vector): number {
    return v1.x * v2.y - v1.y * v2.x;
  }

  /**
   * Normalizes a vector.
   * @param v1 - The vector to normalize.
   * @returns A new Vector instance.
   */
  static unit(v1: Vector): Vector {
    return Vector.from(v1).normalize();
  }

  /**
   * Normalizes a vector.
   * @alias unit
   * @param v1 - The vector to normalize.
   * @returns A new Vector instance.
   */
  static normalize(v1: Vector): Vector {
    return Vector.from(v1).normalize();
  }

  /**
   * Calculates the direction of a vector.
   * @alias unit
   * @param v1 - The vector to calculate the direction of.
   * @returns A new Vector instance.
   */
  static direction(v1: Vector) {
    return Vector.from(v1).unit();
  }

  /**
   * Connects two vectors.
   * @param v1 - The first vector.
   * @param v2 - The second vector.
   * @returns A new Vector instance.
   */
  static connect(v1: Vector, v2: Vector): Vector {
    return Vector.from(v1).subtract(v2).reverse();
  }

  /**
   * Calculates the distance between two vectors.
   * @param v1 - The first vector.
   * @param v2 - The second vector.
   * @returns The distance between the two vectors.
   */
  static distanceBetween(v1: Vector, v2: Vector): number {
    return Vector.connect(v1, v2).magnitude;
  }

  /**
   * Calculates the angle between two vectors.
   * @param v1 - The first vector.
   * @param v2 - The second vector.
   * @returns The angle between the two vectors.
   */
  static angleBetween(v1: Vector, v2: Vector): number {
    const dotProduct = this.dot(v1, v2);
    const magnitudeProduct = v1.magnitude * v2.magnitude;
    return Math.acos(dotProduct / magnitudeProduct);
  }

  /**
   * Calculates the perpendicular vector of a vector.
   * @param v1 - The vector to calculate the perpendicular vector of.
   * @returns A new Vector instance.
   */
  static normal(v1: Vector): Vector {
    let x = -v1.y;
    let y = v1.x;
    return v1.set(x, y).unit();
  }

  // Vector instance

  /**
   * Creates a new Vector instance.
   * @param x - The x coordinate of the vector.
   * @param y - The y coordinate of the vector.
   */
  constructor(x: number = 0, y: number = 0) {
    this._x = x;
    this._y = y;
    this._magnitude = null;
  }

  /**
   * Gets the value of the x-coordinate.
   * @returns The value of the x-coordinate.
   */
  get x(): number {
    return this._x;
  }

  /**
   * Sets the value of the x-coordinate.
   * @param value - The value to set the x-coordinate to.
   */
  set x(value: number) {
    this._x = value;
    this._magnitude = null;
  }

  /**
   * Gets the value of the y-coordinate.
   * @returns The value of the y-coordinate.
   */
  get y(): number {
    return this._y;
  }

  /**
   * Sets the value of the y-coordinate.
   * @param value - The value to set the y-coordinate to.
   */
  set y(value: number) {
    this._y = value;
    this._magnitude = null;
  }

  /**
   * Gets the magnitude of the vector.
   * @returns The magnitude of the vector.
   */
  get magnitude(): number {
    if (this._magnitude === null) {
      this._magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
    }
    return this._magnitude;
  }

  /**
   * Gets the length of the vector.
   * @alias magnitude
   * @returns The magnitude of the vector.
   */
  get length(): number {
    return this.magnitude;
  }

  /**
   * Gets the angle of the vector.
   * @returns The angle of the vector in radians.
   */
  get angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Sets the coordinates of the vector.
   * @param x - The x coordinate of the vector.
   * @param y - The y coordinate of the vector.
   * @returns The Vector instance.
   */
  public set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Copies the coordinates of another vector.
   * @param vector - The vector to copy the coordinates from.
   * @returns The Vector instance.
   */
  public copy({ x, y }: Vector): this {
    return this.set(x, y);
  }

  /**
   * Adds another vector to this vector.
   * @param vector - The vector to add.
   * @returns The Vector instance.
   */
  public add({ x, y }: Vector): this {
    this.x += x;
    this.y += y;
    return this;
  }

  /**
   * Subtracts another vector from this vector.
   * @param vector - The vector to subtract.
   * @returns The Vector instance.
   */
  public subtract({ x, y }: Vector): this {
    this.x -= x;
    this.y -= y;
    return this;
  }

  /**
   * Multiplies this vector by another vector.
   * @param vector - The vector to multiply by.
   * @returns The Vector instance.
   */
  public multiply({ x, y }: Vector): this {
    this.x *= x;
    this.y *= y;
    return this;
  }

  /**
   * Scales the vector by a scalar.
   * @param scalar - The scalar to scale the vector by.
   * @returns The Vector instance.
   */
  public scale(scalar: number = 1): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * Swap the x and y coordinates of this vector.
   * @returns The Vector instance.
   */
  public swap(): this {
    let x = this.x;
    this.x = this.y;
    this.y = x;
    return this;
  }

  /**
   * Reverse the direction of this vector.
   * @returns The Vector instance.
   */
  public reverse(): this {
    return this.scale(-1);
  }

  /**
   * Normalize this vector.
   * @returns
   */
  public normalize(): this {
    let magnitude = this.magnitude;
    if (magnitude > 0) {
      this.x /= magnitude;
      this.y /= magnitude;
    }
    return this;
  }

  /**
   * Normalize this vector.
   * @alias normalize
   * @returns
   */
  public unit(): this {
    return this.normalize();
  }

  /**
   * check if two vectors are equal by comparing their x and y values
   * @param param0
   * @returns
   */
  public equals({ x, y }: Vector): boolean {
    return this.x === x && this.y === y;
  }
}
