import type { Car } from '../state/types.ts';
import { stopEngine } from '../state/garage-state.ts';
import { stopAnimation } from '../animation/car-animation.ts';
import { startEngine } from '../state/garage-state.ts';
import { animateCar } from '../animation/car-animation.ts';

interface CarActions {
  onUpdate: () => void;
  onDelete: () => void;
}

export function createCarElement( car: Car, actions: CarActions ): HTMLDivElement {
  const carElement = document.createElement('div');

  carElement.className = 'car';
  carElement.dataset.id = String(car.id);
  carElement.innerHTML = `
    <div class="car-controls">
      <button class="update-car" type="button">Update</button>
      <button class="delete-car" type="button">Delete</button>
      <button class="start-engine" type="button">Start</button>
      <button class="stop-engine" type="button" disabled>Stop</button>
    </div>

    <div class="car-info">
      <span>${car.name}</span>
      <div class="car-track">
        <svg class="car-image" viewBox="0 0 100 40" aria-label="${car.name}">
          <path fill="${car.color}" d="M10 25h80l-5-12H65L55 5H35L25 13H15z"/>
          <circle cx="25" cy="28" r="6" />
          <circle cx="75" cy="28" r="6" />
        </svg>
      </div>
    </div>
  `;

  setupStartButton(carElement, car);
  setupStopButton(carElement, car);

  setupButtons(carElement, actions);

  return carElement;
}

function setupStartButton(carElement: HTMLDivElement, car: Car ): void {
  const startButton = carElement.querySelector<HTMLButtonElement>('.start-engine');
  const stopButton = carElement.querySelector<HTMLButtonElement>('.stop-engine');
  const image = carElement.querySelector<SVGElement>('.car-image');
  const track = carElement.querySelector<HTMLDivElement>('.car-track');

  if (
    startButton === null ||
    stopButton === null ||
    image === null ||
    track === null
  ) {
    throw new Error('Car elements were not found');
  }

  startButton.addEventListener('click', () => {
    startButton.disabled = true;
    stopButton.disabled = false;

    void startEngine(car.id).then((engine) => {
        if (engine === null) {
        startButton.disabled = false;
        stopButton.disabled = true;
        return;
      }

      const track = carElement.querySelector<HTMLDivElement>('.car-track');

      if (track === null) {
        startButton.disabled = false;
        stopButton.disabled = true;
        return;
      }

      const trackLength = track.clientWidth - image.clientWidth;

      void animateCar(car.id, image, engine.distance, engine.velocity, trackLength).then(() => {
        stopButton.disabled = true;
        startButton.disabled = false;
      });
    });
  });
}

function setupStopButton( carElement: HTMLDivElement, car: Car ): void {
  const startButton = carElement.querySelector<HTMLButtonElement>('.start-engine');
  const stopButton = carElement.querySelector<HTMLButtonElement>('.stop-engine');
  const image = carElement.querySelector<SVGElement>('.car-image');

  if (
    startButton === null ||
    stopButton === null ||
    image === null
  ) {
    throw new Error('Engine controls were not found');
  }

  stopButton.addEventListener('click', () => {
    stopAnimation(car.id);

    void stopEngine(car.id).then(() => {
      image.style.transform = 'translateX(0)';
      startButton.disabled = false;
      stopButton.disabled = true;
    });
  });
}

function setupButtons( carElement: HTMLDivElement, actions: CarActions ): void {
  const updateButton = carElement.querySelector<HTMLButtonElement>('.update-car');

  const deleteButton = carElement.querySelector<HTMLButtonElement>('.delete-car');

  if (updateButton === null || deleteButton === null) {
    throw new Error('Car control button was not found');
  }

  updateButton.addEventListener('click', actions.onUpdate);
  deleteButton.addEventListener('click', actions.onDelete);
}