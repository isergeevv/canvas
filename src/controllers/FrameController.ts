export default class FrameController {
  private _maxFps: number;
  private _frames: number;
  private _lastFrameTime: number;
  private _lastCalculateFrameTime: number;
  private _currentFps: number;
  private _fpsInterval: number;

  constructor(maxFps: number) {
    this._maxFps = maxFps;
    this._fpsInterval = maxFps ? 1000 / maxFps : 0;

    this._frames = 0;
    this._lastFrameTime = 0;
    this._lastCalculateFrameTime = 0;
    this._currentFps = 0;
  }

  get currentFps() {
    return this._currentFps;
  }
  get maxFps() {
    return this._maxFps;
  }

  addFrame = (timestamp: number): boolean => {
    if (this._fpsInterval > 0) {
      const elapsed = timestamp - this._lastFrameTime;
      if (elapsed < this._fpsInterval) return false;
      this._lastFrameTime = timestamp;
    }

    if (timestamp > this._lastCalculateFrameTime + 1000) {
      this._currentFps = this._frames;
      this._frames = 0;
      this._lastCalculateFrameTime = timestamp;
    }
    this._frames++;

    return true;
  };
}
