import CanvasComponentInterface from '../interface/CanvasComponentInterface';
import { CanvasComponentDrawProps, CanvasComponentEvent, CanvasComponentProps } from '../types';

const CanvasComponent = ({ id, events, init, draw, sceneChange }: CanvasComponentProps) => {
  let _id: string = id || '';
  let _events: Record<string, CanvasComponentEvent> = events || {};
  let _children: CanvasComponentInterface[] = [];

  return <CanvasComponentInterface>{
    get events() {
      return _events;
    },
    get children() {
      return _children;
    },
    get id() {
      return _id;
    },

    drawFrame: (props: CanvasComponentDrawProps) => {
      draw(props);

      for (const child of _children) {
        child.draw(props);
      }
    },

    addChild: (...components: CanvasComponentInterface[]) => {
      _children.push(...components);
    },

    init: init,
    draw: draw,
    sceneChange: sceneChange,
  };
};

export default CanvasComponent;
