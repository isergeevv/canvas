import * as react_jsx_runtime from 'react/jsx-runtime';
import { MutableRefObject, CanvasHTMLAttributes } from 'react';

declare class CanvasSceneController {
    private _scenes;
    private _currentSceneNameRef;
    constructor(scenes: Record<string, CanvasScene>, currentSceneNameRef: MutableRefObject<string>);
    get currentSceneName(): string;
    get currentScene(): CanvasScene;
    setScene: (newSceneName: string) => void;
}

interface CanvasComponentDrawProps {
    ctx: CanvasRenderingContext2D;
    timestamp: number;
    sceneController: CanvasSceneController;
}
interface CanvasComponentInitProps {
}
interface CanvasComponentSceneChangeProps {
    currentScene: string;
    nextScene: string;
}
type CanvasComponentEvent = (e: Event) => boolean | void;
interface CanvasComponentProps {
    draw: (props: CanvasComponentDrawProps) => boolean | void;
    id?: string;
    events?: Record<string, CanvasComponentEvent>;
    init?: (props: CanvasComponentInitProps) => void;
    sceneChange?: (props: CanvasComponentSceneChangeProps) => void;
}

interface CanvasComponentInterface {
    events: Record<string, CanvasComponentEvent>;
    children: CanvasComponentInterface[];
    id: string;
    drawFrame: (props: CanvasComponentDrawProps) => void;
    draw: (props: CanvasComponentDrawProps) => void;
}
interface CanvasComponentInterface {
    init?: (props: CanvasComponentInitProps) => void;
}
interface CanvasComponentInterface {
    sceneChange?: (props: CanvasComponentSceneChangeProps) => void;
}

declare class CanvasScene {
    private _components;
    constructor(components: CanvasComponentInterface[]);
    get components(): CanvasComponentInterface[];
    getComponent: (id: string) => CanvasComponentInterface;
}

type Props = CanvasHTMLAttributes<HTMLCanvasElement> & {
    fill: boolean;
    scenes: Record<string, CanvasScene>;
};
declare const _default: ({ fill, scenes, ...props }: Props) => react_jsx_runtime.JSX.Element;

declare const CANVAS_EVENTS: {
    POINTER_DOWN: string;
    POINTER_MOVE: string;
    POINTER_UP: string;
};

declare abstract class CanvasComponent implements CanvasComponentInterface {
    private _id;
    private _events;
    private _children;
    constructor(id?: string);
    get events(): Record<string, CanvasComponentEvent>;
    get children(): CanvasComponentInterface[];
    get id(): string;
    drawFrame: (props: CanvasComponentDrawProps) => void;
    addChild: (...components: CanvasComponent[]) => void;
    abstract draw(props: CanvasComponentDrawProps): boolean | void;
}

export { CANVAS_EVENTS, CanvasComponent, CanvasComponentDrawProps, CanvasComponentEvent, CanvasComponentInitProps, CanvasComponentInterface, CanvasComponentProps, CanvasComponentSceneChangeProps, CanvasScene, CanvasSceneController, _default as default };
