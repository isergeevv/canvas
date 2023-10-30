import { CANVAS_EVENTS } from '../const';
import { CanvasApp } from '../core';
import { CanvasEvent } from '../types';

export default class ElementEventController {
  private _eventListeners: Map<string, EventListener[]>;
  private _eventCallbacks: Map<string, CanvasEvent[]>;

  constructor() {
    this._eventListeners = new Map();
    this._eventCallbacks = new Map();
  }

  on = (name: string, cb: (app: CanvasApp, e: Event) => void) => {
    const listeners = this._eventCallbacks.get(name);
    if (listeners) {
      listeners.push(cb);
      return;
    }

    this._eventCallbacks.set(name, [cb]);
  };

  attachEvents = (app: CanvasApp) => {
    for (const event of Object.values(CANVAS_EVENTS)) {
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
    for (const event of Object.values(CANVAS_EVENTS)) {
      app.canvas.removeEventListener(event, this._eventListeners[event]);
    }
  };
}
