'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');

var index = ({ fill, draw, ...props }) => {
    const [ctx, setCtx] = react.useState();
    const canvasRef = react.useRef();
    react.useEffect(() => {
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
    return jsxRuntime.jsx("canvas", { ref: canvasRef, ...props });
};

module.exports = index;
