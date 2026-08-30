export interface CarAnimationState {
  isDriving: boolean;
  position: number;
  animationId: number | null;
}

const carStates = new Map<number, CarAnimationState>();

export function getCarState(id: number): CarAnimationState {
  const existingState = carStates.get(id);

  if (existingState !== undefined) {
    return existingState;
  }

  const newState: CarAnimationState = {
    isDriving: false,
    position: 0,
    animationId: null,
  };

  carStates.set(id, newState);

  return newState;
}

export function resetCarState(id: number): void {
  const carState = getCarState(id);

  carState.isDriving = false;
  carState.position = 0;
  carState.animationId = null;
}