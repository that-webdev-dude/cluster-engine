class AnimationItem {
  constructor(frames = [], rate = 0, onCompleted = () => {}) {
    this.onCompleted = onCompleted;
    this.frames = frames;
    this.rate = rate;
    this.reset();
  }

  reset() {
    this.currentFrameIndex = 0;
    this.currentFrame = this.frames[0];
    this.currentTime = 0;
  }

  update(dt) {
    const { rate, frames, onCompleted } = this;
    this.currentTime += dt;
    if (this.currentTime > rate) {
      const nextFrameIndex = this.currentFrameIndex++ % frames.length;
      if (nextFrameIndex === frames.length - 1) {
        onCompleted();
      }
      this.currentFrame = frames[nextFrameIndex];
      this.currentTime -= rate;
    }
  }
}

class Animation {
  constructor(targetEntity) {
    this.animations = {};
    this.running = false;
    this.targetEntity = targetEntity;
    this.currentAnimationName = null;
  }

  add(
    animationName,
    animationFrames,
    animationRate,
    onAnimationCompleted = () => {}
  ) {
    this.animations[animationName] = new AnimationItem(
      animationFrames,
      animationRate,
      onAnimationCompleted
    );
    return this.animations[animationName];
  }

  update(dt) {
    const { currentAnimationName, animations, targetEntity } = this;
    if (!currentAnimationName) return;
    const animation = animations[currentAnimationName];
    animation.update(dt);
    targetEntity.frame.x = animation.currentFrame.x;
    targetEntity.frame.y = animation.currentFrame.y;
  }

  play(animationName) {
    if (this.currentAnimationName === animationName) return;
    this.currentAnimationName = animationName;
    this.animations[animationName].reset();
  }

  stop() {
    this.currentAnimationName = null;
  }
}

export default Animation;
