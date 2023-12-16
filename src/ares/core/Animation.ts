type Frame = {
  x: number;
  y: number;
};

class AnimationItem {
  private _onCompleted: () => void;
  private _frames: Frame[];
  private _rate: number;
  private _currentFrameIndex: number;
  private _currentFrame: Frame;
  private _currentTime: number;

  constructor(
    frames: Frame[] = [],
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

  get currentFrame(): Frame {
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

class Animation {
  private _animations: { [key: string]: AnimationItem };
  private _targetEntity: { frame: Frame };
  private _currentAnimationName: string | null;

  constructor(targetEntity: { frame: Frame }) {
    this._animations = {};
    this._targetEntity = targetEntity;
    this._currentAnimationName = null;
  }

  public add(
    animationName: string,
    animationFrames: Frame[],
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

  get frame(): Frame {
    return this._targetEntity.frame;
  }

  set frame(frame: Frame) {
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
