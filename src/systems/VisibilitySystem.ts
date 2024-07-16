import { Container, Entity, System, Cmath } from "../cluster";
import { Visibility } from "../components/Visibility";
import { Fade } from "../components/Fade";

// system dependencies
const SystemComponents = {
  Visibility,
  Fade,
};

// system errors
enum SystemErrors {
  invalidEasing = "[VisibilitySystem] Invalid easing function.",
}

// system cache
let SystemCache = {
  entities: new Container<Entity>(),
};

export class VisibilitySystem extends System {
  update(entities: Container<Entity>, dt: number, t: number): void {
    if (!entities.size) return;

    SystemCache.entities = entities.filter(
      (entity) =>
        entity.hasComponent(SystemComponents.Visibility) &&
        entity.hasComponent(SystemComponents.Fade)
    );
    if (!SystemCache.entities.size) return;

    SystemCache.entities.forEach((entity) => {
      const visibility = entity.getComponent(SystemComponents.Visibility);
      const fade = entity.getComponent(SystemComponents.Fade);

      if (fade && visibility) {
        fade.elapsedTime += dt;
        if (fade.elapsedTime >= fade.duration) {
          fade.elapsedTime = fade.duration;
          fade.complete = true;
        }

        switch (fade.easing) {
          case "easeIn":
            visibility.opacity = Cmath.ease.in(
              fade.elapsedTime / fade.duration,
              1
            );
            break;
          case "easeOut":
            visibility.opacity = Cmath.ease.out(
              fade.elapsedTime / fade.duration,
              1
            );
            break;
          case "easeInOut":
            visibility.opacity = Cmath.ease.inOut(
              fade.elapsedTime / fade.duration,
              1
            );
            break;
          default:
            throw new Error(SystemErrors.invalidEasing);
        }

        // remove component if fade is complete
        if (fade.complete) {
          if (!fade.loop) {
            entity.detachComponent(fade);
          } else {
            fade.elapsedTime = 0;
            fade.complete = false;
          }
        }
      }
    });

    SystemCache.entities.clear();
  }
}
