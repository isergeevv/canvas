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
    init?: (props: CanvasComponentInitProps) => void;
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

declare const CanvasComponent: ({ id, events, init, draw, sceneChange }: CanvasComponentProps) => CanvasComponentInterface;

export { CANVAS_EVENTS, CanvasComponent, CanvasComponentDrawProps, CanvasComponentEvent, CanvasComponentInitProps, CanvasComponentInterface, CanvasComponentProps, CanvasComponentSceneChangeProps, CanvasScene, CanvasSceneController, _default as default };
