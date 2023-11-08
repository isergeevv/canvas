import CanvasSceneController from './CanvasSceneController';

export default class CanvasAssetsController {
  loadAssets = async (sceneController: CanvasSceneController) => {
    for (const scene of Object.values(sceneController.scenes)) {
      for (const component of scene.components) {
        console.log(component.id, component.loadAssets);
        const assets: Record<string, string> = component.loadAssets && component.loadAssets();
        if (!assets) continue;

        const images = await Promise.all(
          Object.keys(assets).map(
            (key) =>
              new Promise((resolve, reject) => {
                const img = new Image();
                img.onerror = () => reject(`[CanvasAssetsController] ${assets[key]} failed to load`);
                img.onload = () => resolve(img);
                img.src = assets[key];
              }),
          ),
        );

        console.log(images);
      }
    }
  };
}
