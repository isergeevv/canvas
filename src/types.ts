import { CanvasApp } from './core';

export type CanvasEvent = (app: CanvasApp, e: Event) => boolean | void;

export type ComponentEvent = () => void;

export type AppEvent = () => void;

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}
