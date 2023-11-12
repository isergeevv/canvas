import { Asset, CanvasComponentEventHandler, CanvasEvent, Position, Size, To } from '../types';
import * as util from '../util';
import CanvasApp from './CanvasApp';
import EventEmitter from 'events';

export default abstract class CanvasComponent {
  private _pos: Position;
  private _size: Size;
  private _to: To;
  private _id: string;
  private _children: CanvasComponent[];
  private _parent: CanvasComponent | CanvasApp;
  private _events: EventEmitter;
  private _assets: Record<string, Asset>;

  constructor(id = '') {
    this._assets = {};
    this._events = new EventEmitter();
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
      x: undefined,
      y: undefined,
      step: {
        x: undefined,
        y: undefined,
      },
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
  get assets() {
    return this._assets;
  }
  get isMoving() {
    return this.to.x !== undefined || this.to.y !== undefined;
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

  once = (name: string, handler: CanvasComponentEventHandler) => {
    this._events.once(name, handler);
  };
  on = (name: string, handler: CanvasComponentEventHandler) => {
    this._events.on(name, handler);
  };
  emit = (name: string, e: CanvasEvent) => {
    this._events.emit(name, e);
  };
  removeListener = (name: string, handler: CanvasComponentEventHandler) => {
    this._events.removeListener(name, handler);
  };

  prepareFrame = (app: CanvasApp, timestamp: number) => {
    if (this.to.x !== undefined || this.to.y !== undefined) {
      if (this.to.x !== undefined) {
        let newX = this.x + this.to.step.x;
        if ((this.x <= this.to.x && newX >= this.to.x) || (this.x >= this.to.x && newX <= this.to.x)) {
          newX = this.to.x;
          this.to.x = undefined;
        }
        this.x = newX;
      }
      if (this.to.y !== undefined) {
        let newY = this.y + this.to.step.y;
        if ((this.y <= this.to.y && newY >= this.to.y) || (this.y >= this.to.y && newY <= this.to.y)) {
          newY = this.to.y;
          this.to.y = undefined;
        }
        this.y = newY;
      }
      if (this.to.x === undefined && this.to.y === undefined) {
        this.emit('endMove', { app });
      }
    }
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

  removeChild = (component: CanvasComponent) => {
    this._children = this._children.filter((child) => child !== component);
  };

  resizeCanvas = (app: CanvasApp) => {
    this.resize && this.resize(app);
    for (const child of this.children) {
      child.resizeCanvas(app);
    }
  };

  moveTo = async (app: CanvasApp, pos: Partial<Position>, ms: number, cb?: CanvasComponentEventHandler) => {
    return new Promise((resolve) => {
      this.to.x = pos.x;
      this.to.y = pos.y;
      this.to.step = {
        x: util.getStep(this.x, this.to.x, app.maxFps, ms),
        y: util.getStep(this.y, this.to.y, app.maxFps, ms),
      };
      this.once('endMove', () => {
        cb && cb({ app });
        resolve(true);
      });
    });
  };

  abstract draw(ctx: CanvasRenderingContext2D): void;

  init?: (app: CanvasApp) => void;

  prepare?: (app: CanvasApp, timestamp: number) => boolean | void;

  destroy?: (app: CanvasApp) => void;

  loadAssets?: () => Record<string, string>;

  resize?: (app: CanvasApp) => void;
}
