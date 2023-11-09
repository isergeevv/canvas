export const getStep = (cur: number, to: number, maxFps: number, ms: number) => {
  if (to === undefined) return undefined;
  const positive = to > cur;

  const step = Number(
    (cur === to
      ? 0
      : positive
      ? (to - cur) / (maxFps * (ms / 1000))
      : ((cur - to) / (maxFps * (ms / 1000))) * -1
    ).toFixed(5),
  );

  if (!step) return positive ? 0.001 : -0.001;

  return step;
};
