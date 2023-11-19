import CanvasApp from './CanvasApp';
import CanvasComponent from './CanvasComponent';

export default class CanvasScene {
  private _components: CanvasComponent[];

  constructor(components: CanvasComponent[]) {
    this._components = components;
  }

  get components() {
    return this._components;
  }

  init = (app: CanvasApp) => {
    for (const component of this._components) {
      component.init && component.init(app);
    }
  };

  getComponent = (id: string) => {
    return this._components.find((c) => c.id === id) || null;
  };

  addComponent = (component: CanvasComponent) => {
    this._components.push(component);
    this.sortZIndex();
  };

  removeComponent = (component: CanvasComponent) => {
    this._components = this._components.filter((c) => c !== component);
  };

  sortZIndex = () => {
    this._components = this._components.sort((a, b) => a.zIndex - b.zIndex);
  };
}
