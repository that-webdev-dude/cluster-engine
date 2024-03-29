import { Container } from "./Container";
import { Vector } from "../tools/Vector";
import Cmath from "../tools/Cmath";
import { Entity } from "./Entity";

type Measurable = {
  width: number;
  height: number;
};

type CameraConfig = {
  subject?: Entity;
  viewSize: Measurable;
  worldSize?: Measurable;
  trackerSize?: Measurable;
};

export class Camera extends Container {
  private _subject: Entity | null;
  private _viewSize: Measurable;
  private _worldSize: Measurable;
  private _trackerSize: Measurable;
  private _offset: Vector;
  private _easing: number;
  private _shakePower: number;
  private _shakeDecay: number;
  private _shakeLast: Vector;

  constructor(config: CameraConfig) {
    const {
      subject = null,
      viewSize,
      worldSize = null,
      trackerSize = { width: 32, height: 32 },
    } = {
      ...config,
    };

    super();
    this._subject = subject;
    this._viewSize = viewSize;
    this._worldSize = worldSize || viewSize;
    this._trackerSize = trackerSize;
    this._offset = new Vector();
    this._easing = 0.04; // EFFECT: EASING
    this._shakePower = 0; // EFFECT: SHAKE
    this._shakeDecay = 0;
    this._shakeLast = new Vector();
    // EFFECT: FLASH

    this._setSubject(subject);
  }

  get width(): number {
    return this._viewSize.width;
  }

  get height(): number {
    return this._viewSize.height;
  }

  private _setSubject(subject: Entity | null = null): void {
    if (!subject) return;
    const { width, height } = subject;
    this._subject = subject;
    this._offset.set(0, 0);
    this._offset.x += width / 2;
    this._offset.y += height / 2;
    this._offset.subtract(subject.anchor);
  }

  // EFFECT: SHAKE
  shake(power: number = 8, length: number = 0.5) {
    this._shakePower = power;
    this._shakeDecay = power / length;
  }

  // EFFECT: SHAKE
  _shake(dt: number) {
    const { position, _shakePower, _shakeLast } = this;
    if (_shakePower <= 0) {
      return;
    }
    _shakeLast.set(
      Cmath.randf(-_shakePower, _shakePower),
      Cmath.randf(-_shakePower, _shakePower)
    );
    position.add(_shakeLast);
    this._shakePower -= this._shakeDecay * dt;
  }

  _unshake() {
    const { position, _shakeLast } = this;
    position.subtract(_shakeLast);
  }

  private _focus(track: boolean = true) {
    if (!this._subject) return;
    const {
      _trackerSize,
      _worldSize,
      _viewSize,
      _subject,
      _offset,
      _easing,
      position,
    } = this;

    const centeredX = _subject.position.x + _offset.x - _viewSize.width / 2;
    const maxX = _worldSize.width - _viewSize.width;
    let x = -Cmath.clamp(centeredX, 0, maxX);
    const centeredY = _subject.position.y + _offset.y - _viewSize.height / 2;
    const maxY = _worldSize.height - _viewSize.height;
    let y = -Cmath.clamp(centeredY, 0, maxY);

    if (track) {
      if (Math.abs(centeredX + position.x) < _trackerSize.width) {
        x = position.x;
      }
      if (Math.abs(centeredY + position.y) < _trackerSize.height) {
        y = position.y;
      }
    }

    position.x = Cmath.mix(position.x, x, _easing);
    position.y = Cmath.mix(position.y, y, _easing);
  }

  update(dt: number, t: number): void {
    this._unshake();
    super.update(dt, t);
    this._focus(true);
    this._shake(dt);
    // this._flash(dt);
  }
}
