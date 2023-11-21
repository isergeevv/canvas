import { CanvasApp, CanvasComponent } from '../core';
import CanvasScene from '../core/CanvasScene';

export default class CanvasSceneController {
  private _scenes: Record<string, CanvasScene>;
  private _currentSceneName: string;
  private _sortZIndex: boolean;

  constructor() {
    this._scenes = {};
    this._sortZIndex = false;
  }

  get currentSceneName() {
    return this._currentSceneName;
  }
  get currentScene() {
    return this._scenes[this._currentSceneName];
  }
  get scenes() {
    return this._scenes;
  }

  sortZIndex = () => {
    this._sortZIndex = true;
  };

  destroySceneComponents = (app: CanvasApp) => {
    for (const component of this._scenes[this._currentSceneName].components) {
      component.destroy && component.destroy(app);
    }
  };

  init = (startScene?: string) => {
    const firstSceneName = startScene || Object.keys(this._scenes).at(0);
    if (!firstSceneName) {
      throw new Error('[CanvasApp] Missing canvas scene.');
    }

    this._currentSceneName = firstSceneName;
  };

  initSceneComponents = (app: CanvasApp) => {
    for (const component of this._scenes[this._currentSceneName].components) {
      component.init && component.init(app);
    }
  };

  setScene = (newSceneName: string) => {
    if (!Object.keys(this._scenes).includes(newSceneName)) {
      console.error(`[CanvasSceneController] Scene ${newSceneName} was not found.`);
      return;
    }

    this._currentSceneName = newSceneName;
  };

  addScene = (sceneName: string, scene: CanvasScene) => {
    this._scenes[sceneName] = scene;
  };

  removeComponent = (component: CanvasComponent) => {
    this._scenes[this._currentSceneName].removeComponent(component);
  };

  resizeScene = (app: CanvasApp) => {
    for (const component of this._scenes[this._currentSceneName].components) {
      component.resize && component.resize(app);
    }
  };

  drawScene = (app: CanvasApp, timestamp: number) => {
    const scene = this._scenes[this._currentSceneName];

    if (this._sortZIndex) {
      scene.sortZIndex();
      this._sortZIndex = false;
    }

    for (const component of scene.components) {
      this.prepareComponentFrame(app, timestamp, component);
    }

    for (const component of scene.components) {
      component.draw(app.ctx);
    }
  };

  private prepareComponentFrame = (app: CanvasApp, timestamp: number, c: CanvasComponent): boolean => {
    if (c.to.x !== undefined || c.to.y !== undefined) {
      if (c.to.x !== undefined) {
        let newX = c.x + c.to.step.x * c.moveSpeed;
        if ((c.x <= c.to.x && newX >= c.to.x) || (c.x >= c.to.x && newX <= c.to.x)) {
          newX = c.to.x;
          c.to.x = undefined;
        }
        c.x = newX;
      }
      if (c.to.y !== undefined) {
        let newY = c.y + c.to.step.y * c.moveSpeed;
        if ((c.y <= c.to.y && newY >= c.to.y) || (c.y >= c.to.y && newY <= c.to.y)) {
          newY = c.to.y;
          c.to.y = undefined;
        }
        c.y = newY;
      }
      if (c.to.x === undefined && c.to.y === undefined) {
        c.emit('endMove', { app });
      }
    }

    return (c.prepare && c.prepare(app, timestamp)) || false;
  };
}
