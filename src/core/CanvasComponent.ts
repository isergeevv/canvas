import { CanvasAppEventHandler, CanvasAppEvents, Position, Size, To } from '../types';
import CanvasApp from './CanvasApp';

export default abstract class CanvasComponent {
  private _pos: Position;
  private _size: Size;
  private _to: To;
  private _id: string;
  private _children: CanvasComponent[];
  private _parent: CanvasComponent | CanvasApp;
  private _events: Map<string, CanvasAppEventHandler[]>;

  constructor(id = '') {
    this._events = new Map();
    this._children = [];
    this._id = id;
    this._pos = {
      x: 0,
      y: 0,
    };
    this._size = {
      width: 0,
      height: 0,
    };
    this._to = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  get children() {
    return this._children;
  }
  get id() {
    return this._id;
  }
  get x() {
    return this._pos.x;
  }
  get y() {
    return this._pos.y;
  }
  get width() {
    return this._size.width;
  }
  get height() {
    return this._size.height;
  }
  get parent() {
    return this._parent;
  }
  get to() {
    return this._to;
  }

  set x(value: number) {
    this._pos.x = value;
  }
  set y(value: number) {
    this._pos.y = value;
  }
  set width(value: number) {
    this._size.width = value;
  }
  set height(value: number) {
    this._size.height = value;
  }
  set parent(value: CanvasComponent | CanvasApp) {
    this._parent = value;
  }

  on = <T extends keyof CanvasAppEvents>(name: T, cb: CanvasAppEventHandler) => {
    const listeners = this._events.get(name);
    if (listeners) {
      listeners.push(cb);
      return;
    }
    this._events.set(name, [cb]);
  };

  emit = <T extends keyof CanvasAppEvents>(name: T, e: CanvasAppEvents[T]) => {
    const listeners = this._events.get(name) || [];
    for (const listener of listeners) {
      listener(e);
    }
  };

  removeListener = (name: string, cb: CanvasAppEventHandler) => {
    this._events.set(
      name,
      (this._events.get(name) || []).filter((listener) => listener !== cb),
    );
  };

  prepareFrame = (app: CanvasApp, timestamp: number) => {
    if (this.prepare && this.prepare(app, timestamp)) return;

    for (const child of this.children) {
      child.prepareFrame(app, timestamp);
    }
  };

  drawFrame = (ctx: CanvasRenderingContext2D) => {
    this.draw(ctx);
    for (const child of this.children) {
      child.drawFrame(ctx);
    }
  };

  addChild = (...components: CanvasComponent[]) => {
    for (const component of components) {
      this._children.push(component);
      component.parent = this;
    }
  };

  abstract draw(ctx: CanvasRenderingContext2D): void;

  init?: (app: CanvasApp) => void;

  prepare?: (app: CanvasApp, timestamp: number) => boolean | void;

  destroy?: (app: CanvasApp) => void;
}
