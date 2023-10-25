import CanvasSceneController from './controllers/CanvasSceneController';

export interface CanvasComponentDrawProps {
  ctx: CanvasRenderingContext2D;
  timestamp: number;
  sceneController: CanvasSceneController;
}

export interface CanvasComponentInitProps {}

export interface CanvasComponentSceneChangeProps {
  currentScene: string;
  nextScene: string;
}

export type CanvasComponentEvent = (e: Event) => boolean | void;
