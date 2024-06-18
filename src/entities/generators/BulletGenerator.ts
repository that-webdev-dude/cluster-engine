import { Cluster } from "../../cluster/types/cluster.types";
import { Components } from "../../cluster/ecs";
import { Vector } from "../../cluster";
import { Bullet } from "../Bullet";

export const createBullet: Cluster.EntityGenerator<Bullet> = (
  position: Vector,
  speed: Vector
) => {
  const bullet = new Bullet();
  const transformComponent = bullet.getComponent(Components.Transform);
  if (transformComponent) {
    transformComponent.position = position;
  }
  const speedComponent = bullet.getComponent(Components.Speed);
  if (speedComponent) {
    speedComponent.speed = speed;
  }
  const hitboxComponent = bullet.getComponent(Components.Hitbox);
  if (hitboxComponent) {
    hitboxComponent.position = position;
  }
  return bullet;
};

export const createBullets: Cluster.EntityGenerator<Bullet> = (
  sourcePosition: Vector
) => {
  const bulletSpeed = new Vector(800, 0);
  const bullets: Bullet[] = [];
  for (let i = -1; i < 2; i++) {
    bullets.push(
      createBullet(
        Vector.from(sourcePosition).add(new Vector(38, 16)),
        Vector.from(bulletSpeed).add(new Vector(0, i * 100))
      ) as Bullet
    );
  }
  return bullets;
};
