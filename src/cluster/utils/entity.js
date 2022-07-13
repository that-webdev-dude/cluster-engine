import math from "./math";

function center(entity) {
  const { position, width, height } = entity;
  return {
    x: position.x + width / 2,
    y: position.y + height / 2,
  };
}

function distance(a, b) {
  return math.distance(center(a), center(b));
}

export default { center, distance };
