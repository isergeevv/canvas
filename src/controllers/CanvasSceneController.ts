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

  addScene = (sceneName: string, scene: CanvasScene) => {
    this._scenes[sceneName] = scene;
  };
}
