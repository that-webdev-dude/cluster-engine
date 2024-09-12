import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Events from "../events";
import * as Types from "../types";
import { store } from "../store";

export class AnimationSystem extends Cluster.System {
  constructor() {
    super(["Sprite"]);

    store.on<Events.AnimationChangeEvent>(
      "animation-change",
      this._handleAnimationChange.bind(this)
    );
  }

  private _handleAnimationChange(event: Events.AnimationChangeEvent) {
    console.log("AnimationChangeEvent", event);
    const { entity, animationName } = event.data;
    const spriteComponent = entity.get<Components.SpriteComponent>("Sprite")!;
    spriteComponent.currentAnimationName = animationName;
    spriteComponent.animations.get(animationName)?.reset();
  }

  update(entities: Set<Cluster.Entity>, dt: number, t: number) {
    if (!entities.size) return;

    for (const entity of entities) {
      if (entity.dead || !entity.active) continue;

      const animations =
        entity.get<Components.SpriteComponent>("Sprite")?.animations;
      if (!animations || !animations.size) continue;

      const currentAnimationName =
        entity.get<Components.SpriteComponent>("Sprite")?.currentAnimationName;
      if (!currentAnimationName) continue;

      const animation = animations.get(currentAnimationName);
      if (!animation) continue;

      animation.update(dt);

      const { currentFrame } = animation;

      const spriteComponent = entity.get<Components.SpriteComponent>("Sprite")!;

      spriteComponent.frame = spriteComponent.matrixToIndex(
        currentFrame.x,
        currentFrame.y
      );
    }
  }
}
