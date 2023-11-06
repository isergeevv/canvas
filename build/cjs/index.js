'use strict';

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
    _requestFrameId;
    _ctx;
    _sceneController;
    _elementEventController;
    _fill;
    _lastPointerPos;
    _data;
    _state;
    _events;
    constructor(fill) {
        this._events = new Map();
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
    init = (ctx, startScene) => {
        this._ctx = ctx;
        this._sceneController.init(startScene);
        this._sceneController.initSceneComponents(this, this.currentScene.components);
        this._elementEventController.on('pointermove', this.onPointerMove);
    };
    onPointerMove = (_, e) => {
        this._lastPointerPos.x = e.offsetX;
        this._lastPointerPos.y = e.offsetY;
    };
    on = (name, cb) => {
        const listeners = this._events.get(name);
        if (listeners) {
            listeners.push(cb);
            return;
        }
        this._events.set(name, [cb]);
    };
    emit = (name, e) => {
        const listeners = this._events.get(name) || [];
        for (const listener of listeners) {
            listener(e);
        }
    };
    removeListener = (name, cb) => {
        this._events.set(name, (this._events.get(name) || []).filter((listener) => listener !== cb));
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
        this._requestFrameId = window.requestAnimationFrame(this.drawFrame);
    };
    detachEvents = () => {
        window.removeEventListener('resize', this.onWindowResize);
        window.cancelAnimationFrame(this._requestFrameId);
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
        this._ctx.clearRect(0, 0, this.width, this.height);
        for (const component of components) {
            component.drawFrame(this._ctx);
        }
        this._requestFrameId = window.requestAnimationFrame(this.drawFrame);
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
    constructor(id = '') {
        this._events = new Map();
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
            x: 0,
            y: 0,
            width: 0,
            height: 0,
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
    on = (name, cb) => {
        const listeners = this._events.get(name);
        if (listeners) {
            listeners.push(cb);
            return;
        }
        this._events.set(name, [cb]);
    };
    emit = (name, e) => {
        const listeners = this._events.get(name) || [];
        for (const listener of listeners) {
            listener(e);
        }
    };
    removeListener = (name, cb) => {
        this._events.set(name, (this._events.get(name) || []).filter((listener) => listener !== cb));
    };
    prepareFrame = (app, timestamp) => {
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
    init;
    prepare;
    destroy;
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

exports.CanvasApp = CanvasApp;
exports.CanvasComponent = CanvasComponent;
exports.CanvasScene = CanvasScene;
exports.CanvasSceneController = CanvasSceneController;
