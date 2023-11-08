import { CanvasApp } from './core';

export interface CanvasAppOptions {
  fill: boolean;
  maxFps: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface S {
  w: number;
  h: number;
}

export type To = Position & {
  step: Position;
};

export interface CanvasEvent {
  app: CanvasApp;
}

export interface CanvasAppSwitchSceneEvent extends CanvasEvent {
  previous: string;
  current: string;
}

export interface CanvasAppEvents {
  sceneChange: CanvasAppSwitchSceneEvent;
  endMove: CanvasEvent;
}

export type CanvasAppEventHandler = <T extends keyof CanvasAppEvents>(e: CanvasAppEvents[T]) => void;

export interface CanvasElementEvent<T> extends CanvasEvent {
  event: T;
}

export type CanvasElementEventHandler<T> = (e: CanvasElementEvent<T>) => void;

export type CanvasComponentEventHandler = (e: CanvasEvent) => void;

export type Asset =
  | HTMLCanvasElement
  | HTMLImageElement
  | HTMLVideoElement
  | ImageBitmap
  | OffscreenCanvas
  | SVGImageElement;
