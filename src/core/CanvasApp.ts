import EventEmitter from 'events';
import { CanvasSceneController } from '../controllers';
import ElementEventController from '../controllers/ElementEventController';
import { CanvasAppEventHandler, CanvasAppEvents, Position } from '../types';
import CanvasScene from './CanvasScene';

export default class CanvasApp {
  private _ctx: CanvasRenderingContext2D;
  private _sceneController: CanvasSceneController;
  private _elementEventController: ElementEventController;
  private _fill: boolean;
  private _lastPointerPos: Position;
  private _data: any;
  private _state: Map<string, any>;
  private _events: EventEmitter;

  constructor(fill: boolean) {
    this._events = new EventEmitter();
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

    const oldSceneName = this._sceneController.currentSceneName;
    this._sceneController.destroySceneComponents(this, this.currentScene.components);

    this._sceneController.setScene(value);
    this._sceneController.currentScene.init(this);

    this._elementEventController.reloadEvents(this);

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

    this._elementEventController.on('pointermove', this.onPointerMove);

    window.requestAnimationFrame(this.drawFrame);

    this.loadAssets();
  };

  private onPointerMove = (_: CanvasApp, e: PointerEvent) => {
    this._lastPointerPos.x = e.offsetX;
    this._lastPointerPos.y = e.offsetY;
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

    this._elementEventController.attachEvents(this);
  };

  detachEvents = () => {
    window.removeEventListener('resize', this.onWindowResize);

    this._elementEventController.detachEvents(this);
  };

  onWindowResize = () => {
    if (!this._fill) return;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
  };

  drawFrame = (timestamp: number) => {
    const components = this.currentScene.components;

    for (const component of components) {
      component.prepareFrame(this, timestamp);
    }

    // no need to clear rect if a background is always rendering on full screen
    // this._ctx.clearRect(0, 0, this.width, this.height);
    for (const component of components) {
      component.drawFrame(this._ctx);
    }

    window.requestAnimationFrame(this.drawFrame);
  };

  addScene = (sceneName: string, scene: CanvasScene) => {
    for (const component of scene.components) {
      component.parent = this;
    }
    this._sceneController.addScene(sceneName, scene);
  };
}
