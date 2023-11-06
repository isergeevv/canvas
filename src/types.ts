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

export type To = Position & Size;

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

export type CanvasAppEvents = {
  sceneChange: CanvasAppSwitchSceneEvent;
  pointerDown: CanvasAppPointerEvent;
  pointerMove: CanvasAppPointerEvent;
  pointerUp: CanvasAppPointerEvent;
};

export type CanvasAppEventHandler = <T extends keyof CanvasAppEvents>(e: CanvasAppEvents[T]) => void;
