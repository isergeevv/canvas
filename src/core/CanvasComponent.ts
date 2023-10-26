import CanvasComponentInterface from '../interface/CanvasComponentInterface';
import {
  CanvasComponentDrawProps,
  CanvasComponentEvent,
  CanvasComponentInitProps,
  CanvasComponentSceneChangeProps,
} from '../types';

export default abstract class CanvasComponent implements CanvasComponentInterface {
  private _id: string;
  private _events: Record<string, CanvasComponentEvent>;
  private _children: CanvasComponentInterface[];

  constructor(id = '') {
    this._events = {};
    this._children = [];
    this._id = id;
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

  drawFrame = (props: CanvasComponentDrawProps) => {
    this.draw(props);

    for (const child of this.children) {
      child.draw(props);
    }
  };

  addChild = (...components: CanvasComponent[]) => {
    this.children.push(...components);
  };

  abstract draw(props: CanvasComponentDrawProps): boolean | void;
}
