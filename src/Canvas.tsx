import { CanvasHTMLAttributes, useEffect, useRef, useState } from 'react';
import CanvasScene from './core/CanvasScene';
import CanvasSceneController from './controllers/CanvasSceneController';
import { CANVAS_EVENTS } from './const';
import CanvasComponentInterface from './interface/CanvasComponentInterface';

type Props = CanvasHTMLAttributes<HTMLCanvasElement> & {
  fill: boolean;
  scenes: Record<string, CanvasScene>;
};
export default ({ fill, scenes, ...props }: Props) => {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const canvasRef = useRef<HTMLCanvasElement>();
  const eventListeners = useRef<Record<string, EventListener>>({});
  const sceneNameRef = useRef<string>(Object.keys(scenes)[0]);

  const sceneController = new CanvasSceneController(scenes, sceneNameRef);

  useEffect(() => {
    let requestFrameId = 0;

    if (!ctx) {
      setCtx(canvasRef.current.getContext('2d'));
      return;
    }

    for (const scene of Object.values(scenes)) {
      for (const component of scene.components) {
        component.init && component.init({ ctx });
      }
    }

    const onWindowResize = () => {
      if (fill) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    const drawFrame = (timestamp: number) => {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      for (const component of scenes[sceneNameRef.current].components) {
        component.drawFrame({ ctx, timestamp, sceneController });
      }

      requestFrameId = window.requestAnimationFrame(drawFrame);
    };

    const execComponentEvent = (event: string, e: Event, component: CanvasComponentInterface) => {
      const listener = component.events[event];
      if (listener) {
        const stop = listener(e) ?? false;
        if (stop) return true;
      }

      for (const childComponent of component.children) {
        const stop = execComponentEvent(event, e, childComponent);
        if (stop) return true;
      }
    };

    if (fill) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }

    for (const event of Object.values(CANVAS_EVENTS)) {
      eventListeners[event] = (e: Event) => {
        for (const component of scenes[sceneNameRef.current].components) {
          const stop = execComponentEvent(event, e, component);
          if (stop) break;
        }
      };

      canvasRef.current.addEventListener(event, eventListeners[event]);
    }

    window.addEventListener('resize', onWindowResize);
    requestFrameId = window.requestAnimationFrame(drawFrame);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.cancelAnimationFrame(requestFrameId);

      for (const event of Object.values(CANVAS_EVENTS)) {
        canvasRef.current.removeEventListener(event, eventListeners[event]);
      }
    };
  }, [ctx]);

  return <canvas ref={canvasRef} {...props}></canvas>;
};
