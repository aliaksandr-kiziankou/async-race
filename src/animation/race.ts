import type { Car } from '../state/types.ts';
import { startEngine, driveCar } from '../state/garage-state.ts';
import { animateCar, stopAnimation } from './car-animation.ts';

interface RaceResult {
  car: Car;
  time: number;
}

interface PreparedCar {
  car: Car;
  image: SVGElement;
  trackLength: number;
}

interface StartedCar extends PreparedCar {
  engine: {
    distance: number;
    velocity: number;
  };
}

function prepareCars(
  cars: Car[],
  getCarElements: (
    id: number,
  ) => { image: SVGElement; track: HTMLDivElement } | null,
): PreparedCar[] {
  return cars.flatMap((car) => {
    const elements = getCarElements(car.id);

    if (elements === null) {
      return [];
    }

    return [
      {
        car,
        image: elements.image,
        trackLength:
          elements.track.clientWidth - elements.image.clientWidth,
      },
    ];
  });
}

async function startEngines(
  cars: PreparedCar[],
): Promise<StartedCar[]> {
  const results = await Promise.all(
    cars.map(async (item) => ({
      ...item,
      engine: await startEngine(item.car.id),
    })),
  );

  return results.filter(
    (item): item is StartedCar => item.engine !== null,
  );
}

async function runCar(
  item: StartedCar,
  startTime: number,
): Promise<RaceResult | null> {
  const animation = animateCar(
    item.car.id,
    item.image,
    item.engine.distance,
    item.engine.velocity,
    item.trackLength,
  );

  const driveSuccess = await driveCar(item.car.id);

  if (!driveSuccess) {
    stopAnimation(item.car.id);
    await animation;
    return null;
  }

  await animation;

  return {
    car: item.car,
    time: (performance.now() - startTime) / 1000,
  };
}

function getWinner(
  races: Promise<RaceResult | null>[],
): Promise<RaceResult | null> {
  return new Promise((resolve) => {
    let finished = 0;

    races.forEach((race) => {
      void race.then((result) => {
        finished += 1;

        if (result !== null) {
          resolve(result);
          return;
        }

        if (finished === races.length) {
          resolve(null);
        }
      });
    });
  });
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

  const races = startedCars.map((item) =>
    runCar(item, startTime),
  );

  return getWinner(races);
}