import EventEmitter from 'events';
import { SceneController } from '../controllers';
import ElementEventsController from '../controllers/ElementEventsController';
import { CanvasAppEventHandler, CanvasAppEvents, CanvasAppOptions, CanvasElementEvent, Position } from '../types';
import CanvasScene from './CanvasScene';
import FrameController from '../controllers/FrameController';

export default class CanvasApp {
  private _ctx: CanvasRenderingContext2D;
  private _sceneController: SceneController;
  private _elementEventsController: ElementEventsController;
  private _frameController: FrameController;
  private _fill: boolean;
  private _lastPointerPos: Position;
  private _data: any;
  private _state: Map<string, any>;
  private _events: EventEmitter;

  constructor(opt: CanvasAppOptions) {
    this._events = new EventEmitter();
    this._state = new Map();

    this._fill = opt.fill;
    this._lastPointerPos = {
      x: 0,
      y: 0,
    };

    this._sceneController = new SceneController();
    this._elementEventsController = new ElementEventsController();
    this._frameController = new FrameController(opt.maxFps);
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

  set width(value: number) {
    this._ctx.canvas.width = value;
  }
  set height(value: number) {
    this._ctx.canvas.height = value;
  }
  set currentSceneName(value: string) {
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
  }
  set data(value: any) {
    this._data = value;
  }

  loadAssets = async () => {
    for (const scene of Object.values(this._sceneController.scenes)) {
      for (const component of scene.components) {
        console.log(component.id, component.loadAssets);
        const assets: Record<string, string> = component.loadAssets && component.loadAssets();
        if (!assets) continue;

        const images = await Promise.all(
          Object.keys(assets).map(
            (key) =>
              new Promise((resolve, reject) => {
                const img = new Image();
                img.onerror = (e) => reject(`${assets[key]} failed to load`);
                img.onload = (e) => resolve(img);
                img.src = assets[key];
              }),
          ),
        );

        console.log(images);
      }
    }
  };

  init = (ctx: CanvasRenderingContext2D, startScene?: string) => {
    this._ctx = ctx;

    this._sceneController.init(startScene);
    this._sceneController.initSceneComponents(this, this.currentScene.components);

    this._elementEventsController.on('pointermove', this.onPointerMove);

    window.requestAnimationFrame(this.drawFrame);

    this.loadAssets();
  };

  private onPointerMove = (e: CanvasElementEvent<PointerEvent>) => {
    this._lastPointerPos.x = e.event.offsetX;
    this._lastPointerPos.y = e.event.offsetY;
  };

  once = <T extends keyof CanvasAppEvents>(name: T, handler: CanvasAppEventHandler) => {
    this._events.once(name, handler);
  };
  on = <T extends keyof CanvasAppEvents>(name: T, handler: CanvasAppEventHandler) => {
    this._events.on(name, handler);
  };
  emit = <T extends keyof CanvasAppEvents>(name: T, e: CanvasAppEvents[T]) => {
    this._events.emit(name, e);
  };
  removeListener = (name: string, handler: CanvasAppEventHandler) => {
    this._events.removeListener(name, handler);
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

    this._elementEventsController.attachEvents(this);
  };

  detachEvents = () => {
    window.removeEventListener('resize', this.onWindowResize);

    this._elementEventsController.detachEvents(this);
  };

  onWindowResize = () => {
    if (!this._fill) return;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    for (const component of this._sceneController.currentScene.components) {
      component.resizeCanvas(this);
    }
  };

  drawFrame = (timestamp: number) => {
    window.requestAnimationFrame(this.drawFrame);

    if (!this._frameController.addFrame(timestamp)) return;

    this._sceneController.drawScene(this, timestamp);
  };

  addScene = (sceneName: string, scene: CanvasScene) => {
    this._sceneController.addScene(this, sceneName, scene);
  };
}
