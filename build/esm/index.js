import EventEmitter from 'events';

class CanvasElementEventsController {
    _eventListeners;
    _eventCallbacks;
    constructor() {
        this._eventListeners = {};
        this._eventCallbacks = new EventEmitter();
    }
    once = (name, handler) => {
        this._eventCallbacks.once(name, handler);
    };
    on = (name, handler) => {
        this._eventCallbacks.on(name, handler);
    };
    emit = (name, e) => {
        this._eventCallbacks.emit(name, e);
    };
    removeListener = (name, handler) => {
        this._eventCallbacks.removeListener(name, handler);
    };
    attachEvents = (app) => {
        for (const event of this._eventCallbacks.eventNames()) {
            if (typeof event !== 'string')
                continue;
            this._eventListeners[event] = (e) => {
                this.emit(event, { app, event: e });
            };
            app.canvas.addEventListener(event, this._eventListeners[event]);
        }
    };
    detachEvents = (app) => {
        for (const event of Object.keys(this._eventListeners)) {
            app.canvas.removeEventListener(event, this._eventListeners[event]);
        }
        this._eventListeners = {};
        this._eventCallbacks.removeAllListeners();
    };
    resetEvents = () => {
        this._eventCallbacks.removeAllListeners();
    };
    reloadEvents = (app) => {
        this.detachEvents(app);
        this.attachEvents(app);
    };
}

class CanvasFrameController {
    _maxFps;
    _frames;
    _lastFrameTime;
    _lastCalculateFrameTime;
    _currentFps;
    _fpsInterval;
    constructor(maxFps) {
        this._maxFps = maxFps;
        this._fpsInterval = maxFps ? 1000 / maxFps : 0;
        this._frames = 0;
        this._lastFrameTime = 0;
        this._lastCalculateFrameTime = 0;
        this._currentFps = 0;
    }
    get currentFps() {
        return this._currentFps;
    }
    get maxFps() {
        return this._maxFps;
    }
    addFrame = (timestamp) => {
        if (this._fpsInterval > 0) {
            const elapsed = timestamp - this._lastFrameTime;
            if (elapsed < this._fpsInterval)
                return false;
            this._lastFrameTime = timestamp;
        }
        if (timestamp > this._lastCalculateFrameTime + 1000) {
            this._currentFps = this._frames;
            this._frames = 0;
            this._lastCalculateFrameTime = timestamp;
        }
        this._frames++;
        return true;
    };
}

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
    addScene = (app, sceneName, scene) => {
        for (const component of scene.components) {
            component.parent = app;
        }
        this._scenes[sceneName] = scene;
    };
    drawScene = (app, timestamp) => {
        for (const component of this._scenes[this._currentSceneName].components) {
            component.prepareFrame(app, timestamp);
        }
        for (const component of this._scenes[this._currentSceneName].components) {
            component.drawFrame(app.ctx);
        }
    };
}

class CanvasAssetsController {
    loadAssets = async (sceneController) => {
        for (const scene of Object.values(sceneController.scenes)) {
            for (const component of scene.components) {
                console.log(component.id, component.loadAssets);
                const assets = component.loadAssets && component.loadAssets();
                if (!assets)
                    continue;
                const images = await Promise.all(Object.keys(assets).map((key) => new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onerror = () => reject(`[CanvasAssetsController] ${assets[key]} failed to load`);
                    img.onload = () => resolve(img);
                    img.src = assets[key];
                })));
                console.log(images);
            }
        }
    };
}

class CanvasApp {
    _ctx;
    _sceneController;
    _elementEventsController;
    _frameController;
    _assetsController;
    _fill;
    _lastPointerPos;
    _data;
    _state;
    _events;
    constructor(opt) {
        this._events = new EventEmitter();
        this._state = new Map();
        this._fill = opt.fill;
        this._lastPointerPos = {
            x: 0,
            y: 0,
        };
        this._sceneController = new CanvasSceneController();
        this._elementEventsController = new CanvasElementEventsController();
        this._frameController = new CanvasFrameController(opt.maxFps);
        this._assetsController = new CanvasAssetsController();
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
        return this._elementEventsController;
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
    get fps() {
        return this._frameController.currentFps;
    }
    get maxFps() {
        return this._frameController.maxFps;
    }
    set width(value) {
        this._ctx.canvas.width = value;
    }
    set height(value) {
        this._ctx.canvas.height = value;
    }
    set currentSceneName(value) {
        this._elementEventsController.resetEvents();
        const oldSceneName = this._sceneController.currentSceneName;
        this._sceneController.destroySceneComponents(this, this.currentScene.components);
        this._sceneController.setScene(value);
        this._sceneController.currentScene.init(this);
        this._elementEventsController.reloadEvents(this);
        this.emit('sceneChange', {
            app: this,
            previous: oldSceneName,
            current: this._sceneController.currentSceneName,
        });
    }
    set data(value) {
        this._data = value;
    }
    init = (ctx, startScene) => {
        this._ctx = ctx;
        this._sceneController.init(startScene);
        this._sceneController.initSceneComponents(this, this.currentScene.components);
        this._elementEventsController.on('pointermove', this.onPointerMove);
        window.requestAnimationFrame(this.drawFrame);
        this._assetsController.loadAssets(this._sceneController);
    };
    onPointerMove = (e) => {
        this._lastPointerPos.x = e.event.offsetX;
        this._lastPointerPos.y = e.event.offsetY;
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
        this._elementEventsController.attachEvents(this);
    };
    detachEvents = () => {
        window.removeEventListener('resize', this.onWindowResize);
        this._elementEventsController.detachEvents(this);
    };
    onWindowResize = () => {
        if (!this._fill)
            return;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        for (const component of this._sceneController.currentScene.components) {
            component.resizeCanvas(this);
        }
    };
    drawFrame = (timestamp) => {
        window.requestAnimationFrame(this.drawFrame);
        if (!this._frameController.addFrame(timestamp))
            return;
        this._sceneController.drawScene(this, timestamp);
    };
    addScene = (sceneName, scene) => {
        this._sceneController.addScene(this, sceneName, scene);
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
            step: {
                x: undefined,
                y: undefined,
            },
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
                let newX = this.x + this.to.step.x;
                if ((newX >= this.to.x && this.x >= this.to.x) || (newX >= this.to.x && this.x <= this.to.x)) {
                    newX = this.to.x;
                    this.to.x = undefined;
                }
                this.x = newX;
            }
            if (this.to.y !== undefined) {
                let newY = this.y + this.to.step.y;
                if ((newY >= this.to.y && this.y >= this.to.y) || (newY >= this.to.y && this.y <= this.to.y)) {
                    newY = this.to.y;
                    this.to.y = undefined;
                }
                this.y = newY;
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
    moveTo = async (app, pos, ms) => {
        return new Promise((resolve) => {
            this.to.x = pos.x;
            this.to.y = pos.y;
            this.to.step = {
                x: (this.to.x - this.x) / (app.maxFps * (ms / 1000)),
                y: (this.to.y - this.y) / (app.maxFps * (ms / 1000)),
            };
            this.once('endMove', () => {
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

export { CanvasApp, CanvasAssetsController, CanvasComponent, CanvasElementEventsController, CanvasFrameController, CanvasScene, CanvasSceneController };
