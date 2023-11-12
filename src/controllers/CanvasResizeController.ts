import { CanvasApp, CanvasComponent } from '../core';

export default class CanvasResizeController {
  resizeCanvas = (app: CanvasApp, components: CanvasComponent[]) => {
    for (const component of components) {
      component.resize && component.resize(app);
      this.resizeCanvas(app, component.children);
    }
  };
}
