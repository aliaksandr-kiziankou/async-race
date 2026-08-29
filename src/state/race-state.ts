export interface RaceState {
  isRacing: boolean;
  winnerId: number | null;
  winnerTime: number | null;
}

export const raceState: RaceState = {
  isRacing: false,
  winnerId: null,
  winnerTime: null,
};