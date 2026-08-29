import type { Car } from './types.ts';

export interface GarageState {
  cars: Car[];
  totalCount: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
}

export const garageState: GarageState = {
  cars: [],
  totalCount: 0,
  page: 1,
  limit: 7,
  loading: false,
  error: null,
};