export interface Car {
  id: number;
  name: string;
  color: string;
}

export interface Winner {
  id: number;
  wins: number;
  time: number;
}

export interface EngineResponse {
  velocity: number;
  distance: number;
}

export interface CreateCar {
  name: string;
  color: string;
}

export interface DriveResponse {
  success: boolean;
}

export type EngineStatus = 'started' | 'stopped' | 'drive';

export type WinnerSortField = 'wins' | 'time';

export type SortOrder = 'ASC' | 'DESC';

export type View = 'garage' | 'winners';