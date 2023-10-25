import CanvasComponent from '../src/core/CanvasComponent';

describe('CanvasComponent', () => {
  it('construct', () => {
    const component = CanvasComponent({
      draw: () => {},
    });

    expect(component.id).toBe('');
  });
});
