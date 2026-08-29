import type { Car, EngineResponse } from '../state/types.ts';
import { startEngine } from '../state/garage-state.ts';
import { animateCar } from './car-animation.ts';

export async function startCarRace(car: Car, image: SVGElement, trackLength: number): Promise<void> {
  const engine = await startEngine(car.id);

  if (engine === null) {
    return;
  }

  await animateCar(
    car.id,
    image,
    engine.distance,
    engine.velocity,
    trackLength,
  );
}

export async function startRace(cars: Car[], getElements: (id: number) => {image: SVGElement; track: HTMLDivElement} | null): Promise<void> {
  const races = cars.map(async (car) => {
    const elements = getElements(car.id);

    if (elements === null) {
      return null;
    }

    const engine = await startEngine(car.id);

    if (engine === null) {
      return null;
    }

    const trackLength =
      elements.track.clientWidth - elements.image.clientWidth;

    return {
      car,
      image: elements.image,
      engine,
      trackLength,
    };
  });

  const results = await Promise.all(races);

  results.forEach((result) => {
    if (result === null) {
      return;
    }

    void animateCar(
      result.car.id,
      result.image,
      result.engine.distance,
      result.engine.velocity,
      result.trackLength,
    );
  });
}