import { getCarState } from '../state/car-state.ts';

export function animateCar(id: number, element: SVGElement, distance: number, velocity: number, trackLength: number): Promise<number> {
  const carState = getCarState(id);
  const startTime = performance.now();
  const duration = distance / velocity;

  carState.isDriving = true;

  return new Promise((resolve) => {
    function frame(currentTime: number): void {
      if (!carState.isDriving) {
        resolve(0);
        return;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const position = progress * trackLength;

      carState.position = position;
      element.style.transform = `translateX(${position}px)`;

      if (progress < 1) {
        carState.animationId = requestAnimationFrame(frame);
        return;
      }

      carState.animationId = null;
      carState.isDriving = false;
      resolve(duration/1000);
    }

    carState.animationId = requestAnimationFrame(frame);
  });
}

export function stopAnimation(id: number): void {
  const carState = getCarState(id);

  if (carState.animationId !== null) {
    cancelAnimationFrame(carState.animationId);
  }

  carState.isDriving = false;
  carState.animationId = null;
}

export function resetAnimation(
  id: number,
  element: SVGElement,
): void {
  stopAnimation(id);

  const carState = getCarState(id);

  carState.position = 0;
  element.style.transform = 'translateX(0)';
}