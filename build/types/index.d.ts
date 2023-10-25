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

declare abstract class CanvasComponent {
    private _id;
    private _events;
    private _children;
    constructor(id?: string);
    get events(): Map<string, CanvasComponentEvent>;
    get children(): CanvasComponent[];
    get id(): string;
    drawFrame: (props: CanvasComponentDrawProps) => void;
    addChild: (...components: CanvasComponent[]) => void;
    abstract init(props: CanvasComponentInitProps): boolean | void;
    abstract sceneChange(props: CanvasComponentSceneChangeProps): boolean | void;
    abstract draw(props: CanvasComponentDrawProps): boolean | void;
}

declare class CanvasScene {
    private _components;
    constructor(components: CanvasComponent[]);
    get components(): CanvasComponent[];
    getComponent: (id: string) => CanvasComponent;
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

export { CANVAS_EVENTS, CanvasComponent, CanvasComponentDrawProps, CanvasComponentEvent, CanvasComponentInitProps, CanvasComponentSceneChangeProps, CanvasScene, CanvasSceneController, _default as default };
