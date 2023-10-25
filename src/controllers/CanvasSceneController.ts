import { MutableRefObject } from 'react';
import CanvasScene from '../core/CanvasScene';

export default class CanvasSceneController {
  private _scenes: Record<string, CanvasScene>;
  private _currentSceneNameRef: MutableRefObject<string>;

  constructor(scenes: Record<string, CanvasScene>, currentSceneNameRef: MutableRefObject<string>) {
    this._scenes = scenes;
    this._currentSceneNameRef = currentSceneNameRef;
  }

  get currentSceneName() {
    return this._currentSceneNameRef.current;
  }
  get currentScene() {
    return this._scenes[this._currentSceneNameRef.current];
  }

  setScene = (newSceneName: string) => {
    if (!Object.keys(this._scenes).includes(newSceneName)) {
      console.error(`[CanvasSceneController] Scene ${newSceneName} was not found.`);
      return;
    }
    this._currentSceneNameRef.current = newSceneName;
  };
}
