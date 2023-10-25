import {
  CanvasComponentDrawProps,
  CanvasComponentEvent,
  CanvasComponentInitProps,
  CanvasComponentSceneChangeProps,
} from '../types';

export default interface CanvasComponentInterface {
  events: Record<string, CanvasComponentEvent>;
  children: CanvasComponentInterface[];
  id: string;
  drawFrame: (props: CanvasComponentDrawProps) => void;
  draw: (props: CanvasComponentDrawProps) => void;
  init?: (props: CanvasComponentInitProps) => void;
  sceneChange?: (props: CanvasComponentSceneChangeProps) => void;
}
