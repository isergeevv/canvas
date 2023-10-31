import * as react_jsx_runtime from 'react/jsx-runtime';
import { CanvasHTMLAttributes } from 'react';

type CanvasEvent = (app: CanvasApp, e: Event) => boolean | void;
interface Position {
    x: number;
    y: number;
}
interface Size {
    width: number;
    height: number;
}

declare abstract class CanvasComponent {
    private _pos;
    private _size;
    private _id;
    private _events;
    private _children;
    constructor(id?: string);
    get events(): Record<string, CanvasEvent>;
    get children(): CanvasComponent[];
    get id(): string;
    get x(): number;
    get y(): number;
    get width(): number;
    get height(): number;
    set x(value: number);
    set y(value: number);
    set width(value: number);
    set height(value: number);
    drawFrame: (app: CanvasApp, timestamp: number) => void;
    addChild: (...components: CanvasComponent[]) => void;
    abstract draw(app: CanvasApp, timestamp: number): boolean | void;
    init?: (app: CanvasApp) => void;
    sceneChange?: (currentScene: string, nextScene: string) => void;
}

declare class ElementEventController {
    private _eventListeners;
    private _eventCallbacks;
    constructor();
    on: (name: string, cb: (app: CanvasApp, e: Event) => void) => void;
    attachEvents: (app: CanvasApp) => void;
    detachEvents: (app: CanvasApp) => void;
    resetEvents: () => void;
    reloadEvents: (app: CanvasApp) => void;
}

declare class CanvasApp {
    private _requestFrameId;
    private _ctx;
    private _sceneController;
    private _elementEventController;
    private _fill;
    private _lastPointerPos;
    private _data;
    private _state;
    constructor(ctx: CanvasRenderingContext2D, scenes: Record<string, CanvasScene>, fill: boolean);
    get currentScene(): CanvasScene;
    get currentSceneName(): string;
    get scenes(): Record<string, CanvasScene>;
    get ctx(): CanvasRenderingContext2D;
    get canvas(): HTMLCanvasElement;
    get canvasEvents(): ElementEventController;
    get width(): number;
    get height(): number;
    get lastPointerPos(): Position;
    get data(): any;
    set width(value: number);
    set height(value: number);
    set currentSceneName(value: string);
    set data(value: any);
    private onPointerMove;
    getData: (name: string) => any;
    setData: (name: string, value: any) => void;
    getState: (name: string) => any;
    setState: (name: string, value: any) => void;
    attachEvents: () => void;
    detachEvents: () => void;
    onWindowResize: () => void;
    drawFrame: (timestamp: number) => void;
}

declare class CanvasScene {
    private _components;
    constructor(components: CanvasComponent[]);
    get components(): CanvasComponent[];
    init: (app: CanvasApp) => void;
    getComponent: (id: string) => CanvasComponent;
}

type Props = CanvasHTMLAttributes<HTMLCanvasElement> & {
    fill: boolean;
    scenes: Record<string, CanvasScene>;
    data?: any;
};
declare const _default: ({ fill, scenes, data, ...props }: Props) => react_jsx_runtime.JSX.Element;

declare class CanvasSceneController {
    private _scenes;
    private _currentSceneName;
    constructor(scenes: Record<string, CanvasScene>, currentSceneName: string);
    get currentSceneName(): string;
    get currentScene(): CanvasScene;
    get scenes(): Record<string, CanvasScene>;
    init: (app: CanvasApp) => void;
    setScene: (newSceneName: string) => void;
}

export { CanvasApp, CanvasComponent, CanvasEvent, CanvasScene, CanvasSceneController, Position, Size, _default as default };
