import { useEffect, useRef, useState } from 'react';

type Props = {
  fill?: boolean;
  draw: (ctx: CanvasRenderingContext2D, timestamp: number) => void;
};
export default ({ fill, draw, ...props }: Props) => {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();

  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    let requestFrameId = 0;

    if (!ctx) {
      setCtx(canvasRef.current.getContext('2d'));
      return;
    }

    const onWindowResize = () => {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    };

    const onNextFrame = (timestamp: number) => {
      draw(ctx, timestamp);
      requestFrameId = window.requestAnimationFrame(onNextFrame);
    };

    if (fill) {
      onWindowResize();
      window.addEventListener('resize', onWindowResize);
    }

    requestFrameId = window.requestAnimationFrame(onNextFrame);

    return () => {
      if (fill) window.removeEventListener('resize', onWindowResize);
      window.cancelAnimationFrame(requestFrameId);
    };
  }, [ctx]);

  return <canvas ref={canvasRef} {...props}></canvas>;
};
