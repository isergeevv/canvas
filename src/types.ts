import CanvasSceneController from './controllers/CanvasSceneController';

export interface DrawProps {
  ctx: CanvasRenderingContext2D;
  timestamp: number;
  sceneController: CanvasSceneController;
}

export type CanvasComponentEvent = (e: Event) => boolean | void;
