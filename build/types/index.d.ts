type CanvasEvent = (app: CanvasApp, e: Event) => boolean | void;
type ComponentEvent = () => void;
type AppEvent = () => void;
interface Position {
    x: number;
    y: number;
}
interface Size {
    width: number;
    height: number;
}

declare class ElementEventController {
    private _eventListeners;
    private _eventCallbacks;
    constructor();
    on: (name: string, cb: CanvasEvent) => void;
    attachEvents: (app: CanvasApp) => void;
    detachEvents: (app: CanvasApp) => void;
    resetEvents: () => void;
    reloadEvents: (app: CanvasApp) => void;
}

declare abstract class CanvasComponent {
    private _pos;
    private _size;
    private _id;
    private _children;
    private _parent;
    private _events;
    constructor(id?: string);
    get children(): CanvasComponent[];
    get id(): string;
    get x(): number;
    get y(): number;
    get width(): number;
    get height(): number;
    get parent(): CanvasComponent | CanvasApp;
    set x(value: number);
    set y(value: number);
    set width(value: number);
    set height(value: number);
    set parent(value: CanvasComponent | CanvasApp);
    on: (name: string, cb: ComponentEvent) => void;
    emit: (name: string) => void;
    removeListener: (name: string, cb: ComponentEvent) => void;
    drawFrame: (app: CanvasApp, timestamp: number) => void;
    addChild: (...components: CanvasComponent[]) => void;
    abstract draw(app: CanvasApp, timestamp: number): boolean | void;
    init?: (app: CanvasApp) => void;
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
    private _requestFrameId;
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
    init: (ctx: CanvasRenderingContext2D, startScene?: string) => void;
    private onPointerMove;
    on: (name: string, cb: AppEvent) => void;
    emit: (name: string) => void;
    removeListener: (name: string, cb: AppEvent) => void;
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
    init: (startScene?: string) => void;
    initSceneComponents: (app: CanvasApp, components: CanvasComponent[]) => void;
    setScene: (newSceneName: string) => void;
    addScene: (sceneName: string, scene: CanvasScene) => void;
}

export { AppEvent, CanvasApp, CanvasComponent, CanvasEvent, CanvasScene, CanvasSceneController, ComponentEvent, Position, Size };
