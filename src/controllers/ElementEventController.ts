import { CanvasApp } from '../core';
import { ElementEventHandler } from '../types';

export default class ElementEventController {
  private _eventListeners: Record<string, EventListener>;
  private _eventCallbacks: Map<string, ElementEventHandler[]>;

  constructor() {
    this._eventListeners = {};
    this._eventCallbacks = new Map();
  }

  on = (name: string, cb: ElementEventHandler) => {
    const callbacks = this._eventCallbacks.get(name);
    if (callbacks) {
      callbacks.push(cb);
      return;
    }

    this._eventCallbacks.set(name, [cb]);
  };

  removeListener = (app: CanvasApp, name: string, cb: ElementEventHandler) => {
    const callbacks = this._eventCallbacks.get(name);
    if (!callbacks) return;

    this._eventCallbacks.set(
      name,
      callbacks.filter((l) => l !== cb),
    );

    this.reloadEvents(app);
  };

  attachEvents = (app: CanvasApp) => {
    for (const event of this._eventCallbacks.keys()) {
      const listeners = this._eventCallbacks.get(event);
      this._eventListeners[event] = (e: Event) => {
        for (const cb of listeners) {
          cb(app, e);
        }
      };

      app.canvas.addEventListener(event, this._eventListeners[event]);
    }
  };

  detachEvents = (app: CanvasApp) => {
    for (const event of Object.keys(this._eventListeners)) {
      app.canvas.removeEventListener(event, this._eventListeners[event]);
    }
    this._eventListeners = {};
    this._eventCallbacks = new Map();
  };

  resetEvents = () => {
    this._eventCallbacks = new Map();
  };

  reloadEvents = (app: CanvasApp) => {
    this.detachEvents(app);
    this.attachEvents(app);
  };
}
