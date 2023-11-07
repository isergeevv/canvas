import { CanvasApp } from './core';

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

export type ElementEventHandler = (app: CanvasApp, event: Event) => void;

export interface CanvasAppEvent {
  app: CanvasApp;
}
export interface CanvasAppSwitchSceneEvent extends CanvasAppEvent {
  previous: string;
  current: string;
}
export interface CanvasAppPointerEvent extends CanvasAppEvent {
  event: PointerEvent;
}

export interface CanvasAppEvents {
  sceneChange: CanvasAppSwitchSceneEvent;
  pointerDown: CanvasAppPointerEvent;
  pointerMove: CanvasAppPointerEvent;
  pointerUp: CanvasAppPointerEvent;
  endMove: CanvasAppEvent;
}

export type CanvasAppEventHandler = <T extends keyof CanvasAppEvents>(e: CanvasAppEvents[T]) => void;

export type Asset =
  | HTMLCanvasElement
  | HTMLImageElement
  | HTMLVideoElement
  | ImageBitmap
  | OffscreenCanvas
  | SVGImageElement;
