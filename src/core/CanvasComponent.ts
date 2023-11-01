import { CanvasEvent, ComponentEvent, Position, Size } from '../types';
import CanvasApp from './CanvasApp';

export default abstract class CanvasComponent {
  private _pos: Position;
  private _size: Size;
  private _id: string;
  private _children: CanvasComponent[];
  private _parent: CanvasComponent | CanvasApp;
  private _events: Map<string, ComponentEvent[]>;

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

  on = (name: string, cb: ComponentEvent) => {
    const listeners = this._events.get(name);
    if (listeners) {
      listeners.push(cb);
      return;
    }
    this._events.set(name, [cb]);
  };

  emit = (name: string) => {
    const listeners = this._events.get(name) || [];
    for (const listener of listeners) {
      listener();
    }
  };

  removeListener = (name: string, cb: ComponentEvent) => {
    this._events.set(
      name,
      (this._events.get(name) || []).filter((listener) => listener !== cb),
    );
  };

  drawFrame = (app: CanvasApp, timestamp: number) => {
    this.draw(app, timestamp);

    for (const child of this.children) {
      child.drawFrame(app, timestamp);
    }
  };

  addChild = (...components: CanvasComponent[]) => {
    for (const component of components) {
      this._children.push(component);
      component.parent = this;
    }
  };

  abstract draw(app: CanvasApp, timestamp: number): boolean | void;

  init?: (app: CanvasApp) => void;
}
