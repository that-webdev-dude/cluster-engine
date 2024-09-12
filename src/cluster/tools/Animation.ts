type AnimationFrame = { x: number; y: number };

type AnimationRate = number;

export class AnimationItem {
  currentTime: number;
  currentFrame: AnimationFrame;
  currentFrameIndex: number;
  frames: AnimationFrame[];
  rate: AnimationRate;

  constructor(frames: AnimationFrame[], rate = 0) {
    this.currentTime = 0;
    this.currentFrame = frames[0];
    this.frames = frames;
    this.rate = rate;
    this.currentFrameIndex = 0;

    this.reset();
  }

  reset() {
    this.currentTime = 0;
    this.currentFrame = this.frames[0];
    this.currentFrameIndex = 0;
  }

  update(dt: number) {
    const { rate, frames } = this;
    this.currentTime += dt;
    if (this.currentTime > rate) {
      const nextFrameIndex = this.currentFrameIndex++ % frames.length;
      this.currentFrame = frames[nextFrameIndex];
      this.currentTime -= rate;
    }
  }
}

export default Animation;
