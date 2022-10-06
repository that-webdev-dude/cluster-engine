class Matrix {
  constructor() {
    const rows = 2;
    const cols = 2;
    this.data = Array(rows)
      .fill(0)
      .map((r) => {
        return Array(cols).fill(0);
      });
  }

  /**
   * matrix multiplication
   * between the vector parameter
   * and this matrix
   * @param {*} vector
   * @returns vector containing the result
   */
  multiplyVector(vector) {
    let { x, y } = vector;
    let { data } = this;
    let rx = x * data[0][0] + y * data[(0, 1)];
    let ry = x * data[1][0] + y * data[(1, 1)];
    return new Vector(rx, ry);
  }
}

class RotationMatrix extends Matrix {
  constructor(angle = 0) {
    super();
    this.angle = angle;
    this.data[0][0] = Math.cos(this.angle);
    this.data[0][1] = -Math.sin(this.angle);
    this.data[1][0] = Math.sin(this.angle);
    this.data[1][1] = Math.cos(this.angle);
  }

  /**
   *
   * @param {*} angle
   */
  rotateVector(angle) {
    this.angle = angle;
  }
}

export { Matrix, RotationMatrix };
