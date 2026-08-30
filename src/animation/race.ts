import type { Car } from '../state/types.ts';
import { startEngine } from '../state/garage-state.ts';
import { animateCar } from './car-animation.ts';

interface RaceResult {
  car: Car;
  time: number;
}

interface PreparedCar {
  car: Car;
  image: SVGElement;
  trackLength: number;
}

function prepareCars(cars: Car[], getCarElements: (id: number) => { image: SVGElement; track: HTMLDivElement } | null): PreparedCar[] {
  return cars.flatMap((car) => {
    const elements = getCarElements(car.id);

    if (elements === null) {
      return [];
    }

    return [{
      car,
      image: elements.image,
      trackLength:
        elements.track.clientWidth - elements.image.clientWidth,
    }];
  });
}

async function startEngines(cars: PreparedCar[]): Promise<(PreparedCar & {engine: { distance: number; velocity: number };})[]> {
  const results = await Promise.all(
    cars.map(async (item) => ({
      ...item,
      engine: await startEngine(item.car.id),
    })),
  );

  return results.filter(
    (item): item is PreparedCar & {
      engine: { distance: number; velocity: number };
    } => item.engine !== null,
  );
}

function runCar(
  item: PreparedCar & {
    engine: { distance: number; velocity: number };
  },
  startTime: number,
): Promise<RaceResult> {
  return animateCar(
    item.car.id,
    item.image,
    item.engine.distance,
    item.engine.velocity,
    item.trackLength,
  ).then(() => ({
    car: item.car,
    time: (performance.now() - startTime) / 1000,
  }));
}

export async function startRace(
  cars: Car[],
  getCarElements: (
    id: number,
  ) => { image: SVGElement; track: HTMLDivElement } | null,
): Promise<RaceResult | null> {
  const preparedCars = prepareCars(cars, getCarElements);

  if (preparedCars.length === 0) {
    return null;
  }

  const startedCars = await startEngines(preparedCars);

  if (startedCars.length === 0) {
    return null;
  }

  const startTime = performance.now();

  return Promise.race(
    startedCars.map((item) => runCar(item, startTime)),
  );
}