import { CanvasEvent, Position, Size } from '../types';
import CanvasApp from './CanvasApp';

export default abstract class CanvasComponent {
  private _pos: Position;
  private _size: Size;
  private _id: string;
  private _events: Record<string, CanvasEvent>;
  private _children: CanvasComponent[];

  constructor(id = '') {
    this._events = {};
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

  get events() {
    return this._events;
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

  drawFrame = (app: CanvasApp, timestamp: number) => {
    this.draw(app, timestamp);

    for (const child of this.children) {
      child.drawFrame(app, timestamp);
    }
  };

  addChild = (...components: CanvasComponent[]) => {
    this.children.push(...components);
  };

  abstract draw(app: CanvasApp, timestamp: number): boolean | void;

  init?: (app: CanvasApp) => void;

  sceneChange?: (currentScene: string, nextScene: string) => void;
}
