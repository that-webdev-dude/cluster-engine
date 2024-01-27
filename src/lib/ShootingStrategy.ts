import { Vector } from "../ares";
import { Cannon } from "./Cannon";
import { Bullet } from "../entities/Bullet";

type seconds = number;

/**
 * ShootingStrategy is an abstract class that defines the interface for
 * shooting strategies.
 */
abstract class ShootingStrategy {
  abstract get reloadTime(): seconds;
  abstract shoot(cannon: Cannon): Bullet[];
}

/**
 * DefaultShootingStrategy is a default shooting strategy that shoots
 * a single bullet.
 */
class DefaultShootingStrategy extends ShootingStrategy {
  private static readonly RELOAD_TIME: seconds = 0.25;

  get reloadTime(): number {
    return DefaultShootingStrategy.RELOAD_TIME;
  }

  public shoot(cannon: Cannon): Bullet[] {
    const bullet = cannon.pool.next((b) => {
      b.reset({
        position: cannon.position.clone(),
      });
    });
    return [bullet];
  }
}

class DoubleShootingStrategy extends ShootingStrategy {
  private static readonly RELOAD_TIME: seconds = 0.25;

  get reloadTime(): number {
    return DoubleShootingStrategy.RELOAD_TIME;
  }

  public shoot(cannon: Cannon): Bullet[] {
    const bullet1 = cannon.pool.next((b) => {
      b.reset({
        position: cannon.position
          .clone()
          .set(cannon.position.x, cannon.position.y - 12),
      });
    });
    const bullet2 = cannon.pool.next((b) => {
      b.reset({
        position: cannon.position
          .clone()
          .set(cannon.position.x, cannon.position.y + 12),
      });
    });
    return [bullet1, bullet2];
  }
}

export { ShootingStrategy, DefaultShootingStrategy, DoubleShootingStrategy };
