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

export interface CanvasComponentProps {
  draw: (props: CanvasComponentDrawProps) => boolean | void;
  id?: string;
  events?: Record<string, CanvasComponentEvent>;
  init?: (props: CanvasComponentInitProps) => void;
  sceneChange?: (props: CanvasComponentSceneChangeProps) => void;
}
