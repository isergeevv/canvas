interface CanvasAppOptions {
    fill: boolean;
    maxFps: number;
}
interface Position {
    x: number;
    y: number;
}
interface Size {
    width: number;
    height: number;
}
interface S {
    w: number;
    h: number;
}
type To = Position & {
    step: Position;
};
interface CanvasEvent {
    app: CanvasApp;
}
interface CanvasElementEvent<T> extends CanvasEvent {
    event: T;
}
type CanvasElementEventHandler<T> = (e: CanvasElementEvent<T>) => void;
type CanvasEventHandler = (e: CanvasEvent) => void;
type Asset = HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageBitmap | OffscreenCanvas | SVGImageElement;

declare abstract class CanvasComponent {
    private _pos;
    private _size;
    private _to;
    private _moveSpeed;
    private _zIndex;
    private _id;
    private _events;
    private _assets;
    constructor(id?: string);
    get id(): string;
    get x(): number;
    get y(): number;
    get width(): number;
    get height(): number;
    get to(): To;
    get assets(): Record<string, Asset>;
    get isMoving(): boolean;
    get zIndex(): number;
    get moveSpeed(): number;
    set x(value: number);
    set y(value: number);
    set width(value: number);
    set height(value: number);
    set moveSpeed(value: number);
    setZIndex(app: CanvasApp, value: number): void;
    once: (name: string, handler: CanvasEventHandler) => void;
    on: (name: string, handler: CanvasEventHandler) => void;
    emit: (name: string, e: CanvasEvent) => void;
    removeListener: (name: string, handler: CanvasEventHandler) => void;
    moveTo: (app: CanvasApp, pos: Partial<Position>, ms: number, cb?: CanvasEventHandler) => Promise<unknown>;
    removeMove: (app: CanvasApp) => void;
    abstract draw(ctx: CanvasRenderingContext2D): void;
    init?: (app: CanvasApp) => void;
    prepare?: (app: CanvasApp, timestamp: number) => boolean | void;
    destroy?: (app: CanvasApp) => void;
    loadAssets?: () => Record<string, string>;
    resize?: (app: CanvasApp) => void;
}

declare class CanvasScene {
    private _components;
    constructor(components: CanvasComponent[]);
    get components(): CanvasComponent[];
    init: (app: CanvasApp) => void;
    getComponent: (id: string) => CanvasComponent;
    addComponent: (component: CanvasComponent) => void;
    removeComponent: (component: CanvasComponent) => void;
    sortZIndex: () => void;
}

declare class CanvasElementEventsController {
    private _eventListeners;
    private _eventCallbacks;
    constructor();
    once: <T>(name: string, handler: CanvasElementEventHandler<T>) => void;
    on: <T>(name: string, handler: CanvasElementEventHandler<T>) => void;
    emit: <T>(name: string, e: CanvasElementEvent<T>) => void;
    removeListener: <T>(name: string, handler: CanvasElementEventHandler<T>) => void;
    attachEvents: (app: CanvasApp) => void;
    detachEvents: (app: CanvasApp) => void;
    resetEvents: () => void;
    reloadEvents: (app: CanvasApp) => void;
}

declare class CanvasApp {
    private _ctx;
    private _sceneController;
    private _elementEventsController;
    private _frameController;
    private _assetsController;
    private _fill;
    private _lastPointerPos;
    private _data;
    private _state;
    private _events;
    private _windowResizeDebounce;
    constructor(opt: CanvasAppOptions);
    get x(): number;
    get y(): number;
    get currentScene(): CanvasScene;
    get currentSceneName(): string;
    get scenes(): Record<string, CanvasScene>;
    get ctx(): CanvasRenderingContext2D;
    get canvas(): HTMLCanvasElement;
    get canvasEvents(): CanvasElementEventsController;
    get width(): number;
    get height(): number;
    get lastPointerPos(): Position;
    get fps(): number;
    get maxFps(): number;
    set width(value: number);
    set height(value: number);
    sortZIndex: () => void;
    setContext: (ctx: CanvasRenderingContext2D) => void;
    init: (startScene?: string) => void;
    setScene: (value: string) => void;
    once: (name: string, handler: CanvasEventHandler) => void;
    on: (name: string, handler: CanvasEventHandler) => void;
    emit: (name: string, e: CanvasEvent) => void;
    removeListener: (name: string, handler: CanvasEventHandler) => void;
    getData: <T>(name: string) => T;
    setData: <T>(name: string, value: T) => void;
    resetData: () => void;
    getState: <T>(name: string) => T;
    setState: <T>(name: string, value: any) => void;
    resetState: () => void;
    attachEvents: () => void;
    detachEvents: () => void;
    drawFrame: (timestamp: number) => void;
    addScene: (sceneName: string, scene: CanvasScene) => void;
    private onPointerMove;
    private onWindowResize;
}

declare class CanvasSceneController {
    private _scenes;
    private _currentSceneName;
    private _sortZIndex;
    constructor();
    get currentSceneName(): string;
    get currentScene(): CanvasScene;
    get scenes(): Record<string, CanvasScene>;
    sortZIndex: () => void;
    destroySceneComponents: (app: CanvasApp) => void;
    init: (startScene?: string) => void;
    initSceneComponents: (app: CanvasApp) => void;
    setScene: (newSceneName: string) => void;
    addScene: (sceneName: string, scene: CanvasScene) => void;
    removeComponent: (component: CanvasComponent) => void;
    resizeScene: (app: CanvasApp) => void;
    drawScene: (app: CanvasApp, timestamp: number) => void;
    private prepareComponentFrame;
}

declare class CanvasFrameController {
    private _maxFps;
    private _frames;
    private _lastFrameTime;
    private _lastCalculateFrameTime;
    private _currentFps;
    private _fpsInterval;
    constructor(maxFps: number);
    get currentFps(): number;
    get maxFps(): number;
    addFrame: (timestamp: number) => boolean;
}

declare class CanvasAssetsController {
    loadAssets: (sceneController: CanvasSceneController) => Promise<void>;
}

declare const getStep: (cur: number, to: number, maxFps: number, ms: number) => number;

export { Asset, CanvasApp, CanvasAppOptions, CanvasAssetsController, CanvasComponent, CanvasElementEvent, CanvasElementEventHandler, CanvasElementEventsController, CanvasEvent, CanvasEventHandler, CanvasFrameController, CanvasScene, CanvasSceneController, Position, S, Size, To, getStep };
