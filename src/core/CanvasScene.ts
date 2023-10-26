import CanvasComponentInterface from '../interface/CanvasComponentInterface';

export default class CanvasScene {
  private _components: CanvasComponentInterface[];

  constructor(components: CanvasComponentInterface[]) {
    this._components = components;
  }

  get components() {
    return this._components;
  }

  getComponent = (id: string) => {
    return this._components.find((c) => c.id === id) || null;
  };
}
