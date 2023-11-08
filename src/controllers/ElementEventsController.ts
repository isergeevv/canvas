import EventEmitter from 'events';
import { CanvasApp } from '../core';
import { CanvasElementEvent, CanvasElementEventHandler } from '../types';

export default class ElementEventController {
  private _eventListeners: Record<string, EventListener>;
  private _eventCallbacks: EventEmitter;

  constructor() {
    this._eventListeners = {};
    this._eventCallbacks = new EventEmitter();
  }

  once = <T>(name: string, handler: CanvasElementEventHandler<T>) => {
    this._eventCallbacks.once(name, handler);
  };
  on = <T>(name: string, handler: CanvasElementEventHandler<T>) => {
    this._eventCallbacks.on(name, handler);
  };
  emit = <T>(name: string, e: CanvasElementEvent<T>) => {
    this._eventCallbacks.emit(name, e);
  };
  removeListener = <T>(name: string, handler: CanvasElementEventHandler<T>) => {
    this._eventCallbacks.removeListener(name, handler);
  };

  attachEvents = (app: CanvasApp) => {
    for (const event of this._eventCallbacks.eventNames()) {
      if (typeof event !== 'string') continue;

      this._eventListeners[event] = (e: Event) => {
        this.emit(event, { app, event: e });
      };

      app.canvas.addEventListener(event, this._eventListeners[event]);
    }
  };

  detachEvents = (app: CanvasApp) => {
    for (const event of Object.keys(this._eventListeners)) {
      app.canvas.removeEventListener(event, this._eventListeners[event]);
    }
    this._eventListeners = {};
    this._eventCallbacks.removeAllListeners();
  };

  resetEvents = () => {
    this._eventCallbacks.removeAllListeners();
  };

  reloadEvents = (app: CanvasApp) => {
    this.detachEvents(app);
    this.attachEvents(app);
  };
}
