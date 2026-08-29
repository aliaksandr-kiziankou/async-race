import type { Car } from '../state/types.ts';
import { startEngine } from '../state/garage-state.ts';
import { animateCar } from './car-animation.ts';

interface RaceCar {
  car: Car;
  image: SVGElement;
  distance: number;
  velocity: number;
  trackLength: number;
}

export async function startRace(
  cars: Car[],
  getElements: (
    id: number,
  ) => {
    image: SVGElement;
    track: HTMLDivElement;
  } | null,
): Promise<{ car: Car; time: number } | null> {
  const preparedCars = await prepareRaceCars(cars, getElements);

  if (preparedCars.length === 0) {
    return null;
  }

  const races = preparedCars.map((raceCar) =>
    animateRaceCar(raceCar),
  );

  const winner = await Promise.race(races);

  await Promise.all(races);

  if (winner.time === 0) {
    return null;
  }

  return winner;
}

async function prepareRaceCars(
  cars: Car[],
  getElements: (
    id: number,
  ) => {
    image: SVGElement;
    track: HTMLDivElement;
  } | null,
): Promise<RaceCar[]> {
  const results = await Promise.all(
    cars.map(async (car) => {
      const elements = getElements(car.id);

      if (elements === null) {
        return null;
      }

      const engine = await startEngine(car.id);

      if (engine === null) {
        return null;
      }

      return {
        car,
        image: elements.image,
        distance: engine.distance,
        velocity: engine.velocity,
        trackLength:
          elements.track.clientWidth - elements.image.clientWidth,
      };
    }),
  );

  return results.filter(
    (car): car is RaceCar => car !== null,
  );
}

async function animateRaceCar(raceCar: RaceCar): Promise<{ car: Car; time: number }> {
  const time = await animateCar(
    raceCar.car.id,
    raceCar.image,
    raceCar.distance,
    raceCar.velocity,
    raceCar.trackLength,
  );

  return {
    car: raceCar.car,
    time,
  };
}