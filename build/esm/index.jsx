import { jsx } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';

var index = ({ fill, draw, ...props }) => {
    const [ctx, setCtx] = useState();
    const canvasRef = useRef();
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
        const onNextFrame = (timestamp) => {
            draw(ctx, timestamp);
            requestFrameId = window.requestAnimationFrame(onNextFrame);
        };
        if (fill) {
            onWindowResize();
            window.addEventListener('resize', onWindowResize);
        }
        requestFrameId = window.requestAnimationFrame(onNextFrame);
        return () => {
            if (fill)
                window.removeEventListener('resize', onWindowResize);
            window.cancelAnimationFrame(requestFrameId);
        };
    }, [ctx]);
    return jsx("canvas", { ref: canvasRef, ...props });
};

export { index as default };
