import CanvasComponent from './CanvasComponent';

export default class CanvasScene {
  private _components: CanvasComponent[];

  constructor(components: CanvasComponent[]) {
    this._components = components;
  }

  get components() {
    return this._components;
  }

  getComponent = (id: string) => {
    return this._components.find((c) => c.id === id) || null;
  };
}
