import { CanvasApp, CanvasComponent } from '../core';
import CanvasScene from '../core/CanvasScene';

export default class CanvasSceneController {
  private _scenes: Record<string, CanvasScene>;
  private _currentSceneName: string;

  constructor() {
    this._scenes = {};
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

  destroySceneComponents = (app: CanvasApp, components: CanvasComponent[]) => {
    for (const component of components) {
      component.destroy && component.destroy(app);
      this.destroySceneComponents(app, component.children);
    }
  };

  init = (startScene?: string) => {
    const firstSceneName = startScene || Object.keys(this._scenes).at(0);
    if (!firstSceneName) {
      throw new Error('[CanvasApp] Missing canvas scene.');
    }

    this._currentSceneName = firstSceneName;
  };

  initSceneComponents = (app: CanvasApp, components: CanvasComponent[]) => {
    for (const component of components) {
      component.init && component.init(app);
      this.initSceneComponents(app, component.children);
    }
  };

  setScene = (newSceneName: string) => {
    if (!Object.keys(this._scenes).includes(newSceneName)) {
      console.error(`[CanvasSceneController] Scene ${newSceneName} was not found.`);
      return;
    }

    this._currentSceneName = newSceneName;
  };

  addScene = (app: CanvasApp, sceneName: string, scene: CanvasScene) => {
    for (const component of scene.components) {
      component.parent = app;
    }
    this._scenes[sceneName] = scene;
  };

  drawScene = (app: CanvasApp, timestamp: number) => {
    for (const component of this._scenes[this._currentSceneName].components) {
      component.prepareFrame(app, timestamp);
    }
    for (const component of this._scenes[this._currentSceneName].components) {
      component.drawFrame(app.ctx);
    }
  };
}
