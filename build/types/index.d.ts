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
type ElementEventHandler = (app: CanvasApp, event: Event) => void;
interface CanvasAppEvent {
    app: CanvasApp;
}
interface CanvasAppSwitchSceneEvent extends CanvasAppEvent {
    previous: string;
    current: string;
}
interface CanvasAppPointerEvent extends CanvasAppEvent {
    event: PointerEvent;
}
interface CanvasAppEvents {
    sceneChange: CanvasAppSwitchSceneEvent;
    pointerDown: CanvasAppPointerEvent;
    pointerMove: CanvasAppPointerEvent;
    pointerUp: CanvasAppPointerEvent;
    endMove: CanvasAppEvent;
}
type CanvasAppEventHandler = <T extends keyof CanvasAppEvents>(e: CanvasAppEvents[T]) => void;
type Asset = HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageBitmap | OffscreenCanvas | SVGImageElement;

declare class ElementEventController {
    private _eventListeners;
    private _eventCallbacks;
    constructor();
    on: (name: string, cb: ElementEventHandler) => void;
    removeListener: (app: CanvasApp, name: string, cb: ElementEventHandler) => void;
    attachEvents: (app: CanvasApp) => void;
    detachEvents: (app: CanvasApp) => void;
    resetEvents: () => void;
    reloadEvents: (app: CanvasApp) => void;
}

declare abstract class CanvasComponent {
    private _pos;
    private _size;
    private _to;
    private _id;
    private _children;
    private _parent;
    private _events;
    private _assets;
    constructor(id?: string);
    get children(): CanvasComponent[];
    get id(): string;
    get x(): number;
    get y(): number;
    get width(): number;
    get height(): number;
    get parent(): CanvasComponent | CanvasApp;
    get to(): Position;
    get assets(): Record<string, Asset>;
    set x(value: number);
    set y(value: number);
    set width(value: number);
    set height(value: number);
    set parent(value: CanvasComponent | CanvasApp);
    once: <T extends keyof CanvasAppEvents>(name: T, handler: CanvasAppEventHandler) => void;
    on: <T extends keyof CanvasAppEvents>(name: T, handler: CanvasAppEventHandler) => void;
    emit: <T extends keyof CanvasAppEvents>(name: T, e: CanvasAppEvents[T]) => void;
    removeListener: (name: string, handler: CanvasAppEventHandler) => void;
    prepareFrame: (app: CanvasApp, timestamp: number) => void;
    drawFrame: (ctx: CanvasRenderingContext2D) => void;
    addChild: (...components: CanvasComponent[]) => void;
    resizeCanvas: (app: CanvasApp) => void;
    moveTo: (pos: Partial<Position>) => Promise<void>;
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
}

declare class CanvasApp {
    private _ctx;
    private _sceneController;
    private _elementEventController;
    private _fill;
    private _lastPointerPos;
    private _data;
    private _state;
    private _events;
    constructor(fill: boolean);
    get x(): number;
    get y(): number;
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
    loadAssets: () => Promise<void>;
    init: (ctx: CanvasRenderingContext2D, startScene?: string) => void;
    private onPointerMove;
    once: <T extends keyof CanvasAppEvents>(name: T, handler: CanvasAppEventHandler) => void;
    on: <T extends keyof CanvasAppEvents>(name: T, handler: CanvasAppEventHandler) => void;
    emit: <T extends keyof CanvasAppEvents>(name: T, e: CanvasAppEvents[T]) => void;
    removeListener: (name: string, handler: CanvasAppEventHandler) => void;
    getState: (name: string) => any;
    setState: (name: string, value: any) => void;
    attachEvents: () => void;
    detachEvents: () => void;
    onWindowResize: () => void;
    drawFrame: (timestamp: number) => void;
    addScene: (sceneName: string, scene: CanvasScene) => void;
}

declare class CanvasSceneController {
    private _scenes;
    private _currentSceneName;
    constructor();
    get currentSceneName(): string;
    get currentScene(): CanvasScene;
    get scenes(): Record<string, CanvasScene>;
    destroySceneComponents: (app: CanvasApp, components: CanvasComponent[]) => void;
    init: (startScene?: string) => void;
    initSceneComponents: (app: CanvasApp, components: CanvasComponent[]) => void;
    setScene: (newSceneName: string) => void;
    addScene: (sceneName: string, scene: CanvasScene) => void;
}

export { Asset, CanvasApp, CanvasAppEvent, CanvasAppEventHandler, CanvasAppEvents, CanvasAppPointerEvent, CanvasAppSwitchSceneEvent, CanvasComponent, CanvasScene, CanvasSceneController, ElementEventHandler, Position, S, Size };
