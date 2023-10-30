import { CanvasHTMLAttributes, useEffect, useRef, useState } from 'react';
import CanvasScene from './core/CanvasScene';
import CanvasApp from './core/CanvasApp';

type Props = CanvasHTMLAttributes<HTMLCanvasElement> & {
  fill: boolean;
  scenes: Record<string, CanvasScene>;
  data?: any;
};
export default ({ fill, scenes, data, ...props }: Props) => {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const canvasRef = useRef<HTMLCanvasElement>();
  const canvasApp = useRef<CanvasApp>();

  useEffect(() => {
    if (!ctx) {
      const ctx = canvasRef.current.getContext('2d');
      canvasApp.current = new CanvasApp(ctx, scenes, fill);
      setCtx(ctx);
      return;
    }

    canvasApp.current.data = data;
    canvasApp.current.attachEvents();

    return () => {
      canvasApp.current.detachEvents();
    };
  }, [ctx, data]);

  return <canvas ref={canvasRef} {...props}></canvas>;
};
