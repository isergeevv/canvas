import EventEmitter from 'events';
import { CanvasApp } from '../core';
import { CanvasElementEvent, CanvasElementEventHandler, ELEMENT_EVENT_TYPES } from '../types';

export default class CanvasElementEventsController {
  private _eventListeners: Map<ELEMENT_EVENT_TYPES, EventListener>;
  private _eventCallbacks: EventEmitter;

  constructor() {
    this._eventListeners = new Map();
    this._eventCallbacks = new EventEmitter();
  }

  once = <T>(name: ELEMENT_EVENT_TYPES, handler: CanvasElementEventHandler<T>) => {
    this._eventCallbacks.once(name, handler);
  };
  on = <T>(name: ELEMENT_EVENT_TYPES, handler: CanvasElementEventHandler<T>) => {
    this._eventCallbacks.on(name, handler);
  };
  emit = <T>(name: ELEMENT_EVENT_TYPES, e: CanvasElementEvent<T>) => {
    this._eventCallbacks.emit(name, e);
  };
  removeListener = <T>(name: ELEMENT_EVENT_TYPES, handler: CanvasElementEventHandler<T>) => {
    this._eventCallbacks.removeListener(name, handler);
  };

  attachEvents = (app: CanvasApp) => {
    for (const event of this._eventCallbacks.eventNames() as ELEMENT_EVENT_TYPES[]) {
      if (!Object.values(ELEMENT_EVENT_TYPES).includes(event)) continue;

      const cb = (e: Event) => {
        this.emit(event, { app, event: e });
      };

      this._eventListeners.set(event, cb);

      app.canvas.addEventListener(event, cb);
    }
  };

  detachEvents = (app: CanvasApp) => {
    for (const event of Object.keys(this._eventListeners) as ELEMENT_EVENT_TYPES[]) {
      app.canvas.removeEventListener(event, this._eventListeners.get(event));
    }
    this._eventListeners = new Map();
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
