import type { Car, CreateCar, DriveResponse, EngineResponse, Winner } from '../state/types.ts';

const API_URL = 'http://localhost:3000';

export interface CarResponse {
    cars: Car[];
    totalCount: number;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function getCars(page: number, limit: number): Promise<CarResponse> {
    const response = await fetch(
        `${API_URL}/garage?_page=${page}&_limit=${limit}`
    );

    const cars = await parseResponse<Car[]>(response);
    const totalCount = Number(response.headers.get('X-Total-Count'));
    
    return {
        cars,
        totalCount
    };
}

export async function createCar(car: CreateCar): Promise<Car> {
  const response = await fetch(`${API_URL}/garage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(car),
  });

  return parseResponse<Car>(response);
}

export async function deleteCar(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/garage/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete car: ${response.status}`);
  }
}

export async function updateCar(id: number, car: CreateCar): Promise<Car> {
  const response = await fetch(`${API_URL}/garage/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(car),
  });

  return parseResponse<Car>(response);
}

export async function startEngine(
  id: number,
): Promise<EngineResponse> {
  const response = await fetch(
    `${API_URL}/engine?id=${id}&status=started`,
    {
      method: 'PATCH',
    },
  );

  return parseResponse<EngineResponse>(response);
}

export async function stopEngine(id: number): Promise<void> {
  const response = await fetch(
    `${API_URL}/engine?id=${id}&status=stopped`,
    {
      method: 'PATCH',
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to stop engine: ${response.status}`);
  }
}

export async function driveCar(id: number): Promise<DriveResponse> {
  const response = await fetch(
    `${API_URL}/engine?id=${id}&status=drive`,
    {
      method: 'PATCH',
    },
  );

  return parseResponse<DriveResponse>(response);
}

export async function createWinner(winner: Winner): Promise<Winner> {
  const response = await fetch(`${API_URL}/winners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(winner),
  });

  return parseResponse<Winner>(response);
}

export async function getWinner(id: number): Promise<Winner | null> {
  const response = await fetch(`${API_URL}/winners/${id}`);

  if (response.status === 404) {
    return null;
  }

  return parseResponse<Winner>(response);
}

export async function updateWinner(id: number, wins: number, time: number): Promise<Winner> {
  const response = await fetch(`${API_URL}/winners/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      wins,
      time,
    }),
  });

  return parseResponse<Winner>(response);
}