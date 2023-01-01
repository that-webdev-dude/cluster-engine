import cluster from "../cluster";

const { Container, Vector, Rect } = cluster;

class Progress extends Container {
  constructor(
    {
      min = 0,
      max = 100,
      position = new Vector(),
      indicator = {
        width: 64,
        height: 32,
        style: { fill: "red", stroke: "black", lineWidth: 1 },
      },
    } = {
      min: 0,
      max: 100,
      position: new Vector(),
      indicator: {
        width: 64,
        height: 32,
        style: { fill: "red", stroke: "black", lineWidth: 1 },
      },
    }
  ) {
    super();
    this.minWidth = 0;
    this.maxWidth = indicator.width;
    this.minValue = 0;
    this.maxValue = max;
    this.current = max;
    this.updated = false;
    this.position = position;
    this.indicator = this.add(new Rect(indicator));
  }

  get value() {
    return this.current;
  }

  set value(value) {
    if (value >= this.maxValue) {
      this.current = this.maxValue;
      this.updated = true;
      return;
    } else if (value <= this.minValue) {
      this.current = this.minValue;
      this.updated = true;
      return;
    } else {
      this.current = value;
      this.updated = true;
    }
  }

  update(dt, t) {
    super.update(dt, t);
    if (this.updated) {
      this.indicator.width = (this.current * this.maxWidth) / this.maxValue;
      this.updated = false;
    }
  }
}

export default Progress;
