import EventEmitter from 'events';

class CanvasSceneController {
    _scenes;
    _currentSceneName;
    constructor() {
        this._scenes = {};
    }
    get currentSceneName() {
        return this._currentSceneName;
    }
    get currentScene() {
        return this._scenes[this._currentSceneName];
    }
    get scenes() {
        return this._scenes;
    }
    destroySceneComponents = (app, components) => {
        for (const component of components) {
            component.destroy && component.destroy(app);
            this.destroySceneComponents(app, component.children);
        }
    };
    init = (startScene) => {
        const firstSceneName = startScene || Object.keys(this._scenes).at(0);
        if (!firstSceneName) {
            throw new Error('[CanvasApp] Missing canvas scene.');
        }
        this._currentSceneName = firstSceneName;
    };
    initSceneComponents = (app, components) => {
        for (const component of components) {
            component.init && component.init(app);
            this.initSceneComponents(app, component.children);
        }
    };
    setScene = (newSceneName) => {
        if (!Object.keys(this._scenes).includes(newSceneName)) {
            console.error(`[CanvasSceneController] Scene ${newSceneName} was not found.`);
            return;
        }
        this._currentSceneName = newSceneName;
    };
    addScene = (sceneName, scene) => {
        this._scenes[sceneName] = scene;
    };
}

class ElementEventController {
    _eventListeners;
    _eventCallbacks;
    constructor() {
        this._eventListeners = {};
        this._eventCallbacks = new Map();
    }
    on = (name, cb) => {
        const callbacks = this._eventCallbacks.get(name);
        if (callbacks) {
            callbacks.push(cb);
            return;
        }
        this._eventCallbacks.set(name, [cb]);
    };
    removeListener = (app, name, cb) => {
        const callbacks = this._eventCallbacks.get(name);
        if (!callbacks)
            return;
        this._eventCallbacks.set(name, callbacks.filter((l) => l !== cb));
        this.reloadEvents(app);
    };
    attachEvents = (app) => {
        for (const event of this._eventCallbacks.keys()) {
            const listeners = this._eventCallbacks.get(event);
            this._eventListeners[event] = (e) => {
                for (const cb of listeners) {
                    cb(app, e);
                }
            };
            app.canvas.addEventListener(event, this._eventListeners[event]);
        }
    };
    detachEvents = (app) => {
        for (const event of Object.keys(this._eventListeners)) {
            app.canvas.removeEventListener(event, this._eventListeners[event]);
        }
        this._eventListeners = {};
        this._eventCallbacks = new Map();
    };
    resetEvents = () => {
        this._eventCallbacks = new Map();
    };
    reloadEvents = (app) => {
        this.detachEvents(app);
        this.attachEvents(app);
    };
}

class CanvasApp {
    _ctx;
    _sceneController;
    _elementEventController;
    _fill;
    _lastPointerPos;
    _data;
    _state;
    _events;
    constructor(fill) {
        this._events = new EventEmitter();
        this._state = new Map();
        this._fill = fill;
        this._lastPointerPos = {
            x: 0,
            y: 0,
        };
        this._sceneController = new CanvasSceneController();
        this._elementEventController = new ElementEventController();
    }
    get x() {
        return 0;
    }
    get y() {
        return 0;
    }
    get currentScene() {
        return this._sceneController.currentScene;
    }
    get currentSceneName() {
        return this._sceneController.currentSceneName;
    }
    get scenes() {
        return this._sceneController.scenes;
    }
    get ctx() {
        return this._ctx;
    }
    get canvas() {
        return this._ctx.canvas;
    }
    get canvasEvents() {
        return this._elementEventController;
    }
    get width() {
        return this._ctx.canvas.width;
    }
    get height() {
        return this._ctx.canvas.height;
    }
    get lastPointerPos() {
        return this._lastPointerPos;
    }
    get data() {
        return this._data;
    }
    set width(value) {
        this._ctx.canvas.width = value;
    }
    set height(value) {
        this._ctx.canvas.height = value;
    }
    set currentSceneName(value) {
        this._elementEventController.resetEvents();
        const oldSceneName = this._sceneController.currentSceneName;
        this._sceneController.destroySceneComponents(this, this.currentScene.components);
        this._sceneController.setScene(value);
        this._sceneController.currentScene.init(this);
        this._elementEventController.reloadEvents(this);
        this.emit('sceneChange', {
            app: this,
            previous: oldSceneName,
            current: this._sceneController.currentSceneName,
        });
    }
    set data(value) {
        this._data = value;
    }
    loadAssets = async () => {
        for (const scene of Object.values(this._sceneController.scenes)) {
            for (const component of scene.components) {
                console.log(component.id, component.loadAssets);
                const assets = component.loadAssets && component.loadAssets();
                if (!assets)
                    continue;
                const images = await Promise.all(Object.keys(assets).map((key) => new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onerror = (e) => reject(`${assets[key]} failed to load`);
                    img.onload = (e) => resolve(img);
                    img.src = assets[key];
                })));
                console.log(images);
            }
        }
    };
    init = (ctx, startScene) => {
        this._ctx = ctx;
        this._sceneController.init(startScene);
        this._sceneController.initSceneComponents(this, this.currentScene.components);
        this._elementEventController.on('pointermove', this.onPointerMove);
        window.requestAnimationFrame(this.drawFrame);
        this.loadAssets();
    };
    onPointerMove = (_, e) => {
        this._lastPointerPos.x = e.offsetX;
        this._lastPointerPos.y = e.offsetY;
    };
    once = (name, handler) => {
        this._events.once(name, handler);
    };
    on = (name, handler) => {
        this._events.on(name, handler);
    };
    emit = (name, e) => {
        this._events.emit(name, e);
    };
    removeListener = (name, handler) => {
        this._events.removeListener(name, handler);
    };
    getState = (name) => {
        return this._state.get(name) || null;
    };
    setState = (name, value) => {
        this._state.set(name, value);
    };
    attachEvents = () => {
        window.addEventListener('resize', this.onWindowResize);
        this.onWindowResize();
        this._elementEventController.attachEvents(this);
    };
    detachEvents = () => {
        window.removeEventListener('resize', this.onWindowResize);
        this._elementEventController.detachEvents(this);
    };
    onWindowResize = () => {
        if (!this._fill)
            return;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    };
    drawFrame = (timestamp) => {
        const components = this.currentScene.components;
        for (const component of components) {
            component.prepareFrame(this, timestamp);
        }
        // no need to clear rect if a background is always rendering on full screen
        // this._ctx.clearRect(0, 0, this.width, this.height);
        for (const component of components) {
            component.drawFrame(this._ctx);
        }
        window.requestAnimationFrame(this.drawFrame);
    };
    addScene = (sceneName, scene) => {
        for (const component of scene.components) {
            component.parent = this;
        }
        this._sceneController.addScene(sceneName, scene);
    };
}

class CanvasComponent {
    _pos;
    _size;
    _to;
    _id;
    _children;
    _parent;
    _events;
    _assets;
    constructor(id = '') {
        this._assets = {};
        this._events = new EventEmitter();
        this._children = [];
        this._id = id;
        this._pos = {
            x: 0,
            y: 0,
        };
        this._size = {
            width: 0,
            height: 0,
        };
        this._to = {
            x: undefined,
            y: undefined,
        };
    }
    get children() {
        return this._children;
    }
    get id() {
        return this._id;
    }
    get x() {
        return this._pos.x;
    }
    get y() {
        return this._pos.y;
    }
    get width() {
        return this._size.width;
    }
    get height() {
        return this._size.height;
    }
    get parent() {
        return this._parent;
    }
    get to() {
        return this._to;
    }
    get assets() {
        return this._assets;
    }
    set x(value) {
        this._pos.x = value;
    }
    set y(value) {
        this._pos.y = value;
    }
    set width(value) {
        this._size.width = value;
    }
    set height(value) {
        this._size.height = value;
    }
    set parent(value) {
        this._parent = value;
    }
    once = (name, handler) => {
        this._events.once(name, handler);
    };
    on = (name, handler) => {
        this._events.on(name, handler);
    };
    emit = (name, e) => {
        this._events.emit(name, e);
    };
    removeListener = (name, handler) => {
        this._events.removeListener(name, handler);
    };
    prepareFrame = (app, timestamp) => {
        if (this.to.x !== undefined || this.to.y !== undefined) {
            if (this.to.x !== undefined) {
                const newX = this.x + 1;
                if ((newX >= this.x && this.x <= this.to.x) || (newX >= this.x && this.x >= this.to.x)) {
                    this.x = this.to.x;
                    this.to.x = undefined;
                }
            }
            if (this.to.y !== undefined) {
                const newY = this.y + 1;
                if ((newY >= this.y && this.y <= this.to.y) || (newY >= this.y && this.y >= this.to.y)) {
                    this.y = this.to.y;
                    this.to.y = undefined;
                }
            }
            if (this.to.x === undefined && this.to.y === undefined) {
                this.emit('endMove', { app });
            }
        }
        if (this.prepare && this.prepare(app, timestamp))
            return;
        for (const child of this.children) {
            child.prepareFrame(app, timestamp);
        }
    };
    drawFrame = (ctx) => {
        this.draw(ctx);
        for (const child of this.children) {
            child.drawFrame(ctx);
        }
    };
    addChild = (...components) => {
        for (const component of components) {
            this._children.push(component);
            component.parent = this;
        }
    };
    resizeCanvas = (app) => {
        this.resize && this.resize(app);
        for (const child of this.children) {
            child.resizeCanvas(app);
        }
    };
    moveTo = async (pos) => {
        new Promise((resolve) => {
            this.to.x = pos.x;
            this.to.y = pos.y;
            this.on('endMove', () => {
                resolve(true);
            });
        });
    };
    init;
    prepare;
    destroy;
    loadAssets;
    resize;
}

class CanvasScene {
    _components;
    constructor(components) {
        this._components = components;
    }
    get components() {
        return this._components;
    }
    init = (app) => {
        for (const component of this._components) {
            component.init && component.init(app);
        }
    };
    getComponent = (id) => {
        return this._components.find((c) => c.id === id) || null;
    };
    addComponent = (component) => {
        this._components.push(component);
    };
}

export { CanvasApp, CanvasComponent, CanvasScene, CanvasSceneController };
