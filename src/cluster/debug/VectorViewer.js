import Container from "../core/Container";
import Circle from "../shapes/Circle";
import Line from "../shapes/Line";
import Vector from "../utils/Vector";

class VectorViewer extends Container {
  constructor() {
    super();
  }

  display(vector, anchor, onUpdate = (dt, t) => {}, color = "red") {
    const vectorEntity = new Container();
    const vectorMarker = new Circle({
      radius: 10,
      style: {
        fill: "transparent",
        stroke: color,
      },
    });
    const vectorLine = new Line({
      start: new Vector(),
      end: vector,
      style: { stroke: color },
    });

    vectorLine.anchor = { x: 10, y: 10 };
    vectorEntity.add(vectorMarker);
    vectorEntity.add(vectorLine);
    vectorEntity.anchor = anchor;
    vectorEntity.update = onUpdate;
    this.add(vectorEntity);

    return vectorEntity;
  }

  update(dt, t) {
    super.update(dt, t);
  }
}

export default VectorViewer;
