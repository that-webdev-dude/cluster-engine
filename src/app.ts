import ares from "./ares";
import Player from "./entities/Player";
import LaserShootSoundURL from "./sounds/Laser_Shoot.wav";

const game = new ares.Game({
  version: "0.0.1",
  title: "Ares",
  width: 832,
  height: 640,
});

class Sound {
  private context: AudioContext;
  private gainNode: GainNode;
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private isLooping: boolean = false;

  constructor(private url: string) {
    this.context = new AudioContext();
    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.context.destination);
    this.loadSound();
  }

  private async loadSound() {
    const response = await fetch(this.url);
    const arrayBuffer = await response.arrayBuffer();
    this.buffer = await this.context.decodeAudioData(arrayBuffer);
  }

  public play() {
    if (!this.buffer) return;
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = this.isLooping;
    this.source.connect(this.gainNode);
    this.source.start();
  }

  public stop() {
    if (!this.source) return;
    this.source.stop();
    this.source = null;
  }

  set loop(value: boolean) {
    this.isLooping = value;
    if (this.source) {
      this.source.loop = value;
    }
  }

  set volume(value: number) {
    this.gainNode.gain.value = value;
  }
}

const fireSound = new Sound(LaserShootSoundURL);
console.log("file: app.ts:60 ~ fireSound:", fireSound);

export default () => {
  game.start(() => {});
};
