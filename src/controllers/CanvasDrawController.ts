import { CanvasApp, CanvasComponent } from '../core';

export default class CanvasDrawController {
  drawScene = (app: CanvasApp, timestamp: number) => {
    const drawList = this.prepareComponents(app, timestamp, app.currentScene.components);

    const zIndexes = Object.keys(drawList);
    for (const zIndex of zIndexes) {
      for (const component of drawList[zIndex]) {
        component.draw(app.ctx);
        component.zIndex = 0;
      }
    }
  };

  prepareComponents = (
    app: CanvasApp,
    timestamp: number,
    components: CanvasComponent[],
    drawList: Record<string, CanvasComponent[]> = {},
  ) => {
    for (const component of components) {
      const zIndex = component.zIndex;
      if (drawList[zIndex]) drawList[zIndex].push(component);
      else drawList[zIndex] = [component];

      if (!this.prepareFrame(app, timestamp, component)) {
        this.prepareComponents(app, timestamp, component.children, drawList);
      }
    }

    return drawList;
  };

  prepareFrame = (app: CanvasApp, timestamp: number, c: CanvasComponent): boolean => {
    if (c.to.x !== undefined || c.to.y !== undefined) {
      if (c.to.x !== undefined) {
        let newX = c.x + c.to.step.x;
        if ((c.x <= c.to.x && newX >= c.to.x) || (c.x >= c.to.x && newX <= c.to.x)) {
          newX = c.to.x;
          c.to.x = undefined;
        }
        c.x = newX;
      }
      if (c.to.y !== undefined) {
        let newY = c.y + c.to.step.y;
        if ((c.y <= c.to.y && newY >= c.to.y) || (c.y >= c.to.y && newY <= c.to.y)) {
          newY = c.to.y;
          c.to.y = undefined;
        }
        c.y = newY;
      }
      if (c.to.x === undefined && c.to.y === undefined) {
        c.emit('endMove', { app });
      }
    }

    return (c.prepare && c.prepare(app, timestamp)) || false;
  };
}
