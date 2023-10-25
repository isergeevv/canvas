import {
  CanvasComponentDrawProps,
  CanvasComponentEvent,
  CanvasComponentInitProps,
  CanvasComponentSceneChangeProps,
} from '../types';

interface CanvasComponentInterface {
  events: Record<string, CanvasComponentEvent>;
  children: CanvasComponentInterface[];
  id: string;
  drawFrame: (props: CanvasComponentDrawProps) => void;
  draw: (props: CanvasComponentDrawProps) => void;
}

interface CanvasComponentInterface {
  init?: (props: CanvasComponentInitProps) => void;
}

interface CanvasComponentInterface {
  sceneChange?: (props: CanvasComponentSceneChangeProps) => void;
}

export default CanvasComponentInterface;
