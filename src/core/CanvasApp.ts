import { CanvasSceneController } from '../controllers';
import ElementEventController from '../controllers/ElementEventController';
import { AppEvent, Position } from '../types';
import CanvasComponent from './CanvasComponent';
import CanvasScene from './CanvasScene';

export default class CanvasApp {
  private _requestFrameId: number;
  private _ctx: CanvasRenderingContext2D;
  private _sceneController: CanvasSceneController;
  private _elementEventController: ElementEventController;
  private _fill: boolean;
  private _lastPointerPos: Position;
  private _data: any;
  private _state: Map<string, any>;
  private _events: Map<string, AppEvent[]>;

  constructor(fill: boolean) {
    this._events = new Map();
    this._state = new Map();

    this._fill = fill;
    this._lastPointerPos = {
      x: 0,
      y: 0,
    };

    this._sceneController = new CanvasSceneController();
    this._elementEventController = new ElementEventController();
  }

  get x() {
    return 0;
  }
  get y() {
    return 0;
  }

  get currentScene() {
    return this._sceneController.currentScene;
  }
  get currentSceneName() {
    return this._sceneController.currentSceneName;
  }
  get scenes() {
    return this._sceneController.scenes;
  }
  get ctx() {
    return this._ctx;
  }
  get canvas() {
    return this._ctx.canvas;
  }
  get canvasEvents() {
    return this._elementEventController;
  }
  get width() {
    return this._ctx.canvas.width;
  }
  get height() {
    return this._ctx.canvas.height;
  }
  get lastPointerPos() {
    return this._lastPointerPos;
  }
  get data() {
    return this._data;
  }

  set width(value: number) {
    this._ctx.canvas.width = value;
  }
  set height(value: number) {
    this._ctx.canvas.height = value;
  }
  set currentSceneName(value: string) {
    this._elementEventController.resetEvents();

    this._sceneController.setScene(value);
    this._sceneController.currentScene.init(this);

    this._elementEventController.reloadEvents(this);

    this.emit('sceneChange');
  }
  set data(value: any) {
    this._data = value;
  }

  init = (ctx: CanvasRenderingContext2D, startScene?: string) => {
    this._ctx = ctx;

    this._sceneController.init(startScene);
    this._sceneController.initSceneComponents(this, this.currentScene.components);

    this._elementEventController.on('pointermove', this.onPointerMove);
  };

  private onPointerMove = (_: CanvasApp, e: PointerEvent) => {
    this._lastPointerPos.x = e.offsetX;
    this._lastPointerPos.y = e.offsetY;
  };

  on = (name: string, cb: AppEvent) => {
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

  removeListener = (name: string, cb: AppEvent) => {
    this._events.set(
      name,
      (this._events.get(name) || []).filter((listener) => listener !== cb),
    );
  };

  getState = (name: string) => {
    return this._state.get(name) || null;
  };

  setState = (name: string, value: any) => {
    this._state.set(name, value);
  };

  attachEvents = () => {
    window.addEventListener('resize', this.onWindowResize);
    this.onWindowResize();

    this._elementEventController.attachEvents(this);

    this._requestFrameId = window.requestAnimationFrame(this.drawFrame);
  };

  detachEvents = () => {
    window.removeEventListener('resize', this.onWindowResize);
    window.cancelAnimationFrame(this._requestFrameId);

    this._elementEventController.detachEvents(this);
  };

  onWindowResize = () => {
    if (this._fill) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }
  };

  drawFrame = (timestamp: number) => {
    this._ctx.clearRect(0, 0, this.width, this.height);
    for (const component of this.currentScene.components) {
      component.drawFrame(this, timestamp);
    }

    this._requestFrameId = window.requestAnimationFrame(this.drawFrame);
  };

  addScene = (sceneName: string, scene: CanvasScene) => {
    this._sceneController.addScene(sceneName, scene);
  };
}
