import { CanvasApp } from '../core';
import CanvasScene from '../core/CanvasScene';

export default class CanvasSceneController {
  private _scenes: Record<string, CanvasScene>;
  private _currentSceneName: string;

  constructor(scenes: Record<string, CanvasScene>, currentSceneName: string) {
    this._scenes = scenes;
    this._currentSceneName = currentSceneName;
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

  init = (app: CanvasApp) => {
    this.currentScene.init(app);
  };

  setScene = (newSceneName: string) => {
    if (!Object.keys(this._scenes).includes(newSceneName)) {
      console.error(`[CanvasSceneController] Scene ${newSceneName} was not found.`);
      return;
    }

    for (const component of this._scenes[this._currentSceneName].components) {
      component.sceneChange && component.sceneChange(this._currentSceneName, newSceneName);
    }

    this._currentSceneName = newSceneName;
  };
}
