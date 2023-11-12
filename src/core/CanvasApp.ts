import EventEmitter from 'events';
import { CanvasAppEventHandler, CanvasAppEvents, CanvasAppOptions, CanvasElementEvent, Position } from '../types';
import CanvasScene from './CanvasScene';
import CanvasElementEventsController from '../controllers/CanvasElementEventsController';
import CanvasFrameController from '../controllers/CanvasFrameController';
import CanvasSceneController from '../controllers/CanvasSceneController';
import CanvasAssetsController from '../controllers/CanvasAssetsController';
import CanvasDrawController from '../controllers/CanvasDrawController';
import CanvasComponent from './CanvasComponent';

export default class CanvasApp {
  private _ctx: CanvasRenderingContext2D;
  private _sceneController: CanvasSceneController;
  private _drawController: CanvasDrawController;
  private _elementEventsController: CanvasElementEventsController;
  private _frameController: CanvasFrameController;
  private _assetsController: CanvasAssetsController;
  private _fill: boolean;
  private _lastPointerPos: Position;
  private _data: any;
  private _state: Map<string, any>;
  private _events: EventEmitter;
  private _windowResizeDebounce: NodeJS.Timeout;

  constructor(opt: CanvasAppOptions) {
    this._events = new EventEmitter();
    this._state = new Map();

    this._fill = opt.fill;
    this._lastPointerPos = {
      x: 0,
      y: 0,
    };

    this._sceneController = new CanvasSceneController();
    this._elementEventsController = new CanvasElementEventsController();
    this._frameController = new CanvasFrameController(opt.maxFps);
    this._assetsController = new CanvasAssetsController();
    this._drawController = new CanvasDrawController();
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
    return this._elementEventsController;
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
  get fps() {
    return this._frameController.currentFps;
  }
  get maxFps() {
    return this._frameController.maxFps;
  }
  get children() {
    return this._sceneController.currentScene.components;
  }

  set width(value: number) {
    this._ctx.canvas.width = value;
  }
  set height(value: number) {
    this._ctx.canvas.height = value;
  }
  set data(value: any) {
    this._data = value;
  }

  setContext = (ctx: CanvasRenderingContext2D) => {
    this._ctx = ctx;
  };

  init = (startScene?: string) => {
    this._sceneController.init(startScene);
    this._sceneController.initSceneComponents(this, this.currentScene.components);

    this._elementEventsController.on('pointermove', this.onPointerMove);

    window.requestAnimationFrame(this.drawFrame);

    this._assetsController.loadAssets(this._sceneController);
  };

  setScene = (value: string) => {
    this._elementEventsController.resetEvents();

    const oldSceneName = this._sceneController.currentSceneName;
    this._sceneController.destroySceneComponents(this, this.currentScene.components);

    this._sceneController.setScene(value);
    this._sceneController.currentScene.init(this);

    this._elementEventsController.reloadEvents(this);

    this.emit('sceneChange', {
      app: this,
      previous: oldSceneName,
      current: this._sceneController.currentSceneName,
    });
  };

  once = <T extends keyof CanvasAppEvents>(name: T, handler: CanvasAppEventHandler<T>) => {
    this._events.once(name, handler);
  };
  on = <T extends keyof CanvasAppEvents>(name: T, handler: CanvasAppEventHandler<T>) => {
    this._events.on(name, handler);
  };
  emit = <T extends keyof CanvasAppEvents>(name: T, e: CanvasAppEvents[T]) => {
    this._events.emit(name, e);
  };
  removeListener = <T extends keyof CanvasAppEvents>(name: string, handler: CanvasAppEventHandler<T>) => {
    this._events.removeListener(name, handler);
  };

  getState = (name: string) => {
    return this._state.get(name) ?? null;
  };
  setState = (name: string, value: any) => {
    this._state.set(name, value);
  };
  resetState = () => {
    this._state.clear();
  };

  attachEvents = () => {
    window.addEventListener('resize', this.onWindowResize);
    this.onWindowResize();

    this._elementEventsController.attachEvents(this);
  };

  detachEvents = () => {
    window.removeEventListener('resize', this.onWindowResize);

    this._elementEventsController.detachEvents(this);
  };

  drawFrame = (timestamp: number) => {
    window.requestAnimationFrame(this.drawFrame);

    if (!this._frameController.addFrame(timestamp)) return;

    this._drawController.drawScene(this, timestamp);
  };

  addScene = (sceneName: string, scene: CanvasScene) => {
    this._sceneController.addScene(this, sceneName, scene);
  };

  addChild = (...components: CanvasComponent[]) => {
    for (const component of components) {
      this._sceneController.currentScene.addComponent(component);
      component.parent = this;
    }
  };
  removeChild = (component: CanvasComponent) => {
    this._sceneController.removeComponent(component);
  };

  private onPointerMove = (e: CanvasElementEvent<PointerEvent>) => {
    this._lastPointerPos.x = e.event.offsetX;
    this._lastPointerPos.y = e.event.offsetY;
  };

  private onWindowResize = (e?: UIEvent) => {
    if (!this._fill) return;

    const debounce = () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      for (const component of this._sceneController.currentScene.components) {
        component.resizeCanvas(this);
      }
    };

    if (!e) {
      debounce();
      return;
    }

    if (this._windowResizeDebounce) clearTimeout(this._windowResizeDebounce);
    this._windowResizeDebounce = setTimeout(debounce, 50);
  };
}
