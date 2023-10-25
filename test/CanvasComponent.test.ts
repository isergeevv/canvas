import CanvasComponent from '../src/core/CanvasComponent';

describe('CanvasComponent', () => {
  it('construct', () => {
    class Component extends CanvasComponent {
      draw = () => {};
    }
    const component = new Component();

    expect(component.id).toBe('');
  });
});
