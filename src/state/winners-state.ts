import type {
  SortOrder,
  Winner,
  WinnerSortField,
} from './types.ts';

import { getWinners } from '../api/garage-api.ts';

export interface WinnersState {
  winners: Winner[];
  totalCount: number;
  page: number;
  limit: number;
  sort: WinnerSortField;
  order: SortOrder;
  loading: boolean;
  error: string | null;
}

export const winnersState: WinnersState = {
  winners: [],
  totalCount: 0,
  page: 1,
  limit: 10,
  sort: 'wins',
  order: 'DESC',
  loading: false,
  error: null,
};

export async function loadWinners(): Promise<void> {
  winnersState.loading = true;
  winnersState.error = null;

  try {
    const { winners, totalCount } = await getWinners(
      winnersState.page,
      winnersState.limit,
      winnersState.sort,
      winnersState.order,
    );

    winnersState.winners = winners;
    winnersState.totalCount = totalCount;
  } catch (error) {
    winnersState.error =
      error instanceof Error
        ? error.message
        : 'Failed to load winners';
  } finally {
    winnersState.loading = false;
  }
}