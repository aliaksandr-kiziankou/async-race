import type { CreateCar, EngineResponse, Winner } from "./types.ts";
import { garageState } from "./store.ts";
import { generateRandomCar } from '../utils/car-generator.ts';
import { 
  startEngine as startEngineRequest,
  stopEngine as stopEngineRequest,
  updateCar as updateCarRequest,
  createCar as createCarRequest,
  deleteCar as deleteCarRequest,
  driveCar as driveCarRequest,
  createWinner as createWinnerRequest,
  updateWinner as updateWinnerRequest,
  getWinner as getWinnerRequest,
  deleteWinner as deleteWinnerRequest,
  getCars,
} from '../api/garage-api.ts';

const RANDOM_CAR_COUNT = 100;

export async function loadCars(): Promise<void> {
    garageState.loading = true;
  garageState.error = null;

  try {
    const { cars, totalCount } = await getCars(
      garageState.page,
      garageState.limit,
    );

    garageState.cars = cars;
    garageState.totalCount = totalCount;
  } catch (error) {
    garageState.error =
      error instanceof Error ? error.message : 'Failed to load cars';
  } finally {
    garageState.loading = false;
  }
}

export async function createCar(car: CreateCar): Promise<void> {
  garageState.error = null;

  try {
    await createCarRequest(car);
    await loadCars();
  } catch (error) {
    garageState.error =
      error instanceof Error ? error.message : 'Failed to create car';
  }
}

export async function deleteCar(id: number): Promise<void> {
  garageState.error = null;

  try {
    await deleteCarRequest(id);
    await deleteWinnerRequest(id);
    await loadCars();
  } catch (error) {
    garageState.error =
      error instanceof Error
        ? error.message
        : 'Failed to delete car';
  }
}

export async function updateCar(id: number, car: CreateCar): Promise<void> {
  garageState.error = null;

  try {
    await updateCarRequest(id, car);
    await loadCars();
  } catch (error) {
    garageState.error =
      error instanceof Error ? error.message : 'Failed to update car';
  }
}

export async function startEngine(id: number): Promise<EngineResponse | null> {
  garageState.error = null;

  try {
    return await startEngineRequest(id);
  } catch (error) {
    garageState.error =
      error instanceof Error ? error.message : 'Failed to start engine';

    return null;
  }
}

export async function stopEngine(id: number): Promise<void> {
  garageState.error = null;

  try {
    await stopEngineRequest(id);
  } catch (error) {
    garageState.error =
      error instanceof Error ? error.message : 'Failed to stop engine';
  }
}

export async function driveCar(id: number): Promise<boolean> {
  garageState.error = null;

  try {
    const response = await driveCarRequest(id);
    return response.success;
  } catch (error) {
    garageState.error =
      error instanceof Error ? error.message : 'Failed to drive car';

    return false;
  }
}

export async function createWinner(
  winner: Winner,
): Promise<void> {
  garageState.error = null;

  try {
    const existingWinner = await getWinnerRequest(winner.id);

    if (existingWinner === null) {
      await createWinnerRequest(winner);
      return;
    }

    const updatedWinner: Winner = {
      id: existingWinner.id,
      wins: existingWinner.wins + 1,
      time: Math.min(existingWinner.time, winner.time),
    };

    await updateWinnerRequest(winner.id, updatedWinner.wins, updatedWinner.time);
  } catch (error) {
    garageState.error =
      error instanceof Error
        ? error.message
        : 'Failed to save winner';
  }
}

export async function generateCars(): Promise<void> {
  garageState.error = null;

  try {
    for (let index = 0; index < RANDOM_CAR_COUNT; index += 1) {
      await createCarRequest(generateRandomCar());
    }

    await loadCars();
  } catch (error) {
    garageState.error =
      error instanceof Error
        ? error.message
        : 'Failed to generate cars';
  }
}