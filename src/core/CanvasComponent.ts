import {
  CanvasComponentDrawProps,
  CanvasComponentEvent,
  CanvasComponentInitProps,
  CanvasComponentSceneChangeProps,
} from '../types';

export default abstract class CanvasComponent {
  private _id: string;
  private _events: Map<string, CanvasComponentEvent>;
  private _children: CanvasComponent[];

  constructor(id = '') {
    this._events = new Map<string, CanvasComponentEvent>();
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

  abstract init(props: CanvasComponentInitProps): boolean | void;

  abstract sceneChange(props: CanvasComponentSceneChangeProps): boolean | void;

  abstract draw(props: CanvasComponentDrawProps): boolean | void;
}
