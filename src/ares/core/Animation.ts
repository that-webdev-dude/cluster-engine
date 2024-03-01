import { Coordinates } from "../types";

/**
 * @class AnimationItem
 * @description
 * AnimationItem represents a single animation, which is a sequence of frames (Coordinates[]). Each frame is an object with x and y properties.
 * The animation has a rate (_rate) which determines how fast it progresses, and a callback function (_onCompleted) that is called when the animation completes.
 * The update method advances the animation by a given time delta (dt), and if the current time exceeds the rate,
 * it advances to the next frame and calls the completion callback if it's the last frame.
 */
class AnimationItem {
  private _onCompleted: () => void;
  private _frames: Coordinates[];
  private _rate: number;
  private _currentFrameIndex: number;
  private _currentFrame: Coordinates;
  private _currentTime: number;

  constructor(
    frames: Coordinates[] = [],
    rate: number = 0,
    onCompleted: () => void = () => {}
  ) {
    this._onCompleted = onCompleted;
    this._frames = frames;
    this._rate = rate;

    this._currentFrameIndex = 0;
    this._currentFrame = this._frames[0];
    this._currentTime = 0;

    this.reset();
  }

  get currentFrame(): Coordinates {
    return this._currentFrame;
  }

  public reset(): void {
    this._currentFrameIndex = 0;
    this._currentFrame = this._frames[0];
    this._currentTime = 0;
  }

  public update(dt: number): void {
    this._currentTime += dt;
    if (this._currentTime > this._rate) {
      const nextFrameIndex = this._currentFrameIndex++ % this._frames.length;
      if (nextFrameIndex === this._frames.length - 1) {
        this._onCompleted();
      }
      this._currentFrame = this._frames[nextFrameIndex];
      this._currentTime -= this._rate;
    }
  }
}

/**
 * @class Animation
 * @description
 * Animation is a container for multiple AnimationItem instances.
 * It has a target entity (_targetEntity) which is an object with a frame property that gets updated with the current frame of the current animation.
 * The add method adds a new animation to the container. The update method updates the current animation and applies its current frame to the target entity.
 * The play method starts a specific animation, and the stop method stops the current animation.
 */
class Animation {
  private _animations: { [key: string]: AnimationItem };
  private _targetEntity: { frame: Coordinates };
  private _currentAnimationName: string | null;

  constructor(targetEntity: { frame: Coordinates }) {
    this._animations = {};
    this._targetEntity = targetEntity;
    this._currentAnimationName = null;
  }

  public add(
    animationName: string,
    animationFrames: Coordinates[],
    animationRate: number,
    onAnimationCompleted: () => void = () => {}
  ): AnimationItem {
    this._animations[animationName] = new AnimationItem(
      animationFrames,
      animationRate,
      onAnimationCompleted
    );
    return this._animations[animationName];
  }

  get frame(): Coordinates {
    return this._targetEntity.frame;
  }

  set frame(frame: Coordinates) {
    this._targetEntity.frame = frame;
  }

  get length(): number {
    return Object.keys(this._animations).length;
  }

  get currentAnimationName(): string | null {
    return this._currentAnimationName;
  }

  public update(dt: number): void {
    if (!this._currentAnimationName) return;
    const animation = this._animations[this._currentAnimationName];
    animation.update(dt);
    this._targetEntity.frame.x = animation.currentFrame.x;
    this._targetEntity.frame.y = animation.currentFrame.y;
  }

  public play(animationName: string): void {
    if (this._currentAnimationName === animationName) return;
    this._currentAnimationName = animationName;
    this._animations[animationName].reset();
  }

  public stop(): void {
    this._currentAnimationName = null;
  }
}

export default Animation;
