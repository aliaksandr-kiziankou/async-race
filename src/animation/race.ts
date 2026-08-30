import type { Car } from '../state/types.ts';
import { startEngine } from '../state/garage-state.ts';
import { animateCar } from './car-animation.ts';

interface RaceResult {
  car: Car;
  time: number;
}

export async function startCarRace(car: Car, image: SVGElement, trackLength: number): Promise<RaceResult> {
  const engine = await startEngine(car.id);

  if (engine === null) {
    throw new Error(`Failed to start car ${car.id}`);
  }

  const startTime = performance.now();

  await animateCar(
    car.id,
    image,
    engine.distance,
    engine.velocity,
    trackLength,
  );

  return {
    car,
    time: (performance.now() - startTime) / 1000,
  };
}

export async function startRace(cars: Car[], getCarElements: (id: number) => { image: SVGElement; track: HTMLDivElement } | null): Promise<RaceResult | null> {
  const races = cars.map((car) => {
    const elements = getCarElements(car.id);

    if (elements === null) {
      return Promise.reject(
        new Error(`Elements for car ${car.id} not found`),
      );
    }

    const trackLength =
      elements.track.clientWidth - elements.image.clientWidth;

    return startCarRace(
      car,
      elements.image,
      trackLength,
    );
  });

  if (races.length === 0) {
    return null;
  }

  return Promise.race(races);
}