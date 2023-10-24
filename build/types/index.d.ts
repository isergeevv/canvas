import * as react_jsx_runtime from 'react/jsx-runtime';
import { CanvasHTMLAttributes } from 'react';

type Props = CanvasHTMLAttributes<HTMLCanvasElement> & {
    fill?: boolean;
    draw: (ctx: CanvasRenderingContext2D, timestamp: number) => void;
};
declare const _default: ({ fill, draw, ...props }: Props) => react_jsx_runtime.JSX.Element;

export { _default as default };
