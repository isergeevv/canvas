'use strict';

var EventEmitter = require('events');

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
    _sortZIndex;
    constructor() {
        this._scenes = {};
        this._sortZIndex = false;
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
    sortZIndex = () => {
        this._sortZIndex = true;
    };
    destroySceneComponents = (app) => {
        for (const component of this._scenes[this._currentSceneName].components) {
            component.destroy && component.destroy(app);
        }
    };
    init = (startScene) => {
        const firstSceneName = startScene || Object.keys(this._scenes).at(0);
        if (!firstSceneName) {
            throw new Error('[CanvasApp] Missing canvas scene.');
        }
        this._currentSceneName = firstSceneName;
    };
    initSceneComponents = (app) => {
        for (const component of this._scenes[this._currentSceneName].components) {
            component.init && component.init(app);
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
    removeComponent = (component) => {
        this._scenes[this._currentSceneName].removeComponent(component);
    };
    resizeScene = (app) => {
        for (const component of this._scenes[this._currentSceneName].components) {
            component.resize && component.resize(app);
        }
    };
    drawScene = (app, timestamp) => {
        const scene = this._scenes[this._currentSceneName];
        if (this._sortZIndex) {
            scene.sortZIndex();
            this._sortZIndex = false;
        }
        for (const component of scene.components) {
            this.prepareComponentFrame(app, timestamp, component);
        }
        for (const component of scene.components) {
            component.draw(app.ctx);
        }
    };
    prepareComponentFrame = (app, timestamp, c) => {
        if (c.to.x !== undefined || c.to.y !== undefined) {
            if (c.to.x !== undefined) {
                let newX = c.x + c.to.step.x * c.moveSpeed;
                if ((c.x <= c.to.x && newX >= c.to.x) || (c.x >= c.to.x && newX <= c.to.x)) {
                    newX = c.to.x;
                    c.to.x = undefined;
                }
                c.x = newX;
            }
            if (c.to.y !== undefined) {
                let newY = c.y + c.to.step.y * c.moveSpeed;
                if ((c.y <= c.to.y && newY >= c.to.y) || (c.y >= c.to.y && newY <= c.to.y)) {
                    newY = c.to.y;
                    c.to.y = undefined;
                }
                c.y = newY;
            }
            if (c.to.x === undefined && c.to.y === undefined) {
                c.emit('endMove', { app });
            }
        }
        return (c.prepare && c.prepare(app, timestamp)) || false;
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
    _windowResizeDebounce;
    constructor(opt) {
        this._events = new EventEmitter();
        this._state = new Map();
        this._data = new Map();
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
    sortZIndex = () => {
        this._sceneController.sortZIndex();
    };
    setContext = (ctx) => {
        this._ctx = ctx;
    };
    init = (startScene) => {
        this._sceneController.init(startScene);
        this._sceneController.initSceneComponents(this);
        this._elementEventsController.on('pointermove', this.onPointerMove);
        window.requestAnimationFrame(this.drawFrame);
        this._assetsController.loadAssets(this._sceneController);
    };
    setScene = (value) => {
        this._elementEventsController.resetEvents();
        this._sceneController.currentSceneName;
        this._sceneController.destroySceneComponents(this);
        this._sceneController.setScene(value);
        this._sceneController.currentScene.init(this);
        this._elementEventsController.reloadEvents(this);
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
    getData = (name) => {
        return this._data.get(name) ?? null;
    };
    setData = (name, value) => {
        this._data.set(name, value);
    };
    resetData = () => {
        this._data.clear();
    };
    getState = (name) => {
        return this._state.get(name) ?? null;
    };
    setState = (name, value) => {
        this._state.set(name, value);
    };
    resetState = () => {
        this._state.clear();
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
    drawFrame = (timestamp) => {
        window.requestAnimationFrame(this.drawFrame);
        if (!this._frameController.addFrame(timestamp))
            return;
        this._sceneController.drawScene(this, timestamp);
    };
    addScene = (sceneName, scene) => {
        this._sceneController.addScene(sceneName, scene);
    };
    onPointerMove = (e) => {
        this._lastPointerPos.x = e.event.offsetX;
        this._lastPointerPos.y = e.event.offsetY;
    };
    onWindowResize = (e) => {
        if (!this._fill)
            return;
        const debounce = () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this._sceneController.resizeScene(this);
        };
        if (!e) {
            debounce();
            return;
        }
        if (this._windowResizeDebounce)
            clearTimeout(this._windowResizeDebounce);
        this._windowResizeDebounce = setTimeout(debounce, 50);
    };
}

const getStep = (cur, to, maxFps, ms) => {
    if (to === undefined)
        return undefined;
    const positive = to > cur;
    const step = Number((cur === to
        ? 0
        : positive
            ? (to - cur) / (maxFps * (ms / 1000))
            : ((cur - to) / (maxFps * (ms / 1000))) * -1).toFixed(5));
    if (!step)
        return positive ? 0.001 : -0.001;
    return step;
};

class CanvasComponent {
    _pos;
    _size;
    _to;
    _moveSpeed;
    _zIndex;
    _id;
    _events;
    _assets;
    constructor(id = '') {
        this._assets = {};
        this._events = new EventEmitter();
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
        this._zIndex = 0;
        this._moveSpeed = 1;
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
    get to() {
        return this._to;
    }
    get assets() {
        return this._assets;
    }
    get isMoving() {
        return this.to.x !== undefined || this.to.y !== undefined;
    }
    get zIndex() {
        return this._zIndex;
    }
    get moveSpeed() {
        return this._moveSpeed;
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
    set moveSpeed(value) {
        this._moveSpeed = value;
    }
    setZIndex(app, value) {
        this._zIndex = value;
        app.sortZIndex();
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
    moveTo = async (app, pos, ms, cb) => {
        return new Promise((resolve) => {
            this.to.x = pos.x;
            this.to.y = pos.y;
            this.to.step = {
                x: getStep(this.x, this.to.x, app.maxFps, ms),
                y: getStep(this.y, this.to.y, app.maxFps, ms),
            };
            this.once('endMove', () => {
                cb && cb({ app });
                resolve(true);
            });
        });
    };
    removeMove = (app) => {
        this._to = {
            x: undefined,
            y: undefined,
            step: {
                x: undefined,
                y: undefined,
            },
        };
        this.emit('endMove', { app });
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
        this.sortZIndex();
    };
    removeComponent = (component) => {
        this._components = this._components.filter((c) => c !== component);
    };
    sortZIndex = () => {
        this._components = this._components.sort((a, b) => a.zIndex - b.zIndex);
    };
}

exports.CanvasApp = CanvasApp;
exports.CanvasAssetsController = CanvasAssetsController;
exports.CanvasComponent = CanvasComponent;
exports.CanvasElementEventsController = CanvasElementEventsController;
exports.CanvasFrameController = CanvasFrameController;
exports.CanvasScene = CanvasScene;
exports.CanvasSceneController = CanvasSceneController;
exports.getStep = getStep;
