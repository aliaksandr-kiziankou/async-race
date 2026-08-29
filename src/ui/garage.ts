import type { Car, CreateCar } from '../state/types.ts';
import { garageState } from '../state/store.ts';
import { createCar, deleteCar, loadCars, updateCar, createWinner } from '../state/garage-state.ts';
import { createCarElement } from './car.ts';
import { startRace } from '../animation/race.ts';
import { resetAnimation } from '../animation/car-animation.ts';

let editingCarId: number | null = null;

function showWinner(car: Car, time: number): void {
  const message = document.createElement('p');

  message.className = 'winner-message';
  message.textContent =
    `Winner: ${car.name}! Time: ${time.toFixed(2)}s`;

  const garage = document.querySelector<HTMLElement>('.garage');

  if (garage === null) {
    return;
  }

  const oldMessage =
    garage.querySelector<HTMLElement>('.winner-message');

  oldMessage?.remove();

  garage.prepend(message);
}

function createGarageHeader(): HTMLDivElement {
  const header = document.createElement('div');

  header.className = 'garage-header';

  header.innerHTML = `
    <h1>Garage</h1>
    <p>Page #${garageState.page}</p>
    <p>Cars: ${garageState.totalCount}</p>
    <button class="start-race" type="button">Start Race</button>
    <button class="reset-race" type="button">Reset Race</button>
  `;

  setupStartRaceButton(header);
  setupResetRaceButton(header);

  return header;
}

function setupResetRaceButton(header: HTMLDivElement): void {
  const button = header.querySelector<HTMLButtonElement>('.reset-race');

  if (button === null) {
    throw new Error('Reset Race button was not found');
  }

  button.addEventListener('click', () => {
    resetRace();

    const winnerMessage =
      document.querySelector<HTMLElement>('.winner-message');

    winnerMessage?.remove();
  });
}

function resetRace(): void {
  garageState.cars.forEach((car) => {
    resetCar(car);
  });
}

function resetCar(car: Car): void {
  const carElement =
    document.querySelector<HTMLDivElement>(
      `.car[data-id="${car.id}"]`,
    );

  if (carElement === null) {
    return;
  }

  const image =
    carElement.querySelector<SVGElement>('.car-image');

  if (image === null) {
    return;
  }

  resetAnimation(car.id, image);
  resetCarButtons(carElement);
}

function resetCarButtons(carElement: HTMLDivElement): void {
  const startButton =
    carElement.querySelector<HTMLButtonElement>(
      '.start-engine',
    );

  const stopButton =
    carElement.querySelector<HTMLButtonElement>(
      '.stop-engine',
    );

  if (startButton !== null) {
    startButton.disabled = false;
  }

  if (stopButton !== null) {
    stopButton.disabled = true;
  }
}

function setupStartRaceButton(header: HTMLDivElement): void {
  const button =
    header.querySelector<HTMLButtonElement>('.start-race');

  if (button === null) {
    throw new Error('Start Race button was not found');
  }

  button.addEventListener('click', () => {
    button.disabled = true;

    void runRace().finally(() => {
      button.disabled = false;
    });
  });
}

async function runRace(): Promise<void> {
  const winner = await startRace(
    garageState.cars,
    getCarElements,
  );

  if (winner === null) {
    return;
  }

  showWinner(winner.car, winner.time);

  await createWinner({
    id: winner.car.id,
    wins: 1,
    time: winner.time,
  });
}

function getCarElements(id: number): {image: SVGElement; track: HTMLDivElement} | null {
  const car = document.querySelector<HTMLDivElement>(
    `.car[data-id="${id}"]`,
  );

  if (car === null) {
    return null;
  }

  const image =
    car.querySelector<SVGElement>('.car-image');

  const track =
    car.querySelector<HTMLDivElement>('.car-track');

  if (image === null || track === null) {
    return null;
  }

  return {
    image,
    track,
  };
}

function createCarForm(): HTMLFormElement {
  const form = document.createElement('form');
  form.className = 'car-form';

  const editingCar = garageState.cars.find(
    (car) => car.id === editingCarId,
  );

  const name = editingCar?.name ?? '';
  const color = editingCar?.color ?? '#000000';
  const buttonText = editingCarId === null ? 'Create' : 'Update';

  form.innerHTML = `
    <input
      type="text"
      name="name"
      placeholder="Car name"
      value="${name}"
      required
    >
    <input
      type="color"
      name="color"
      value="${color}"
    >
    <button type="submit">${buttonText}</button>
  `;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const car = getCarFormData(formData);

    if (car === null) {
      return;
    }

    if (editingCarId === null) {
      void createCar(car).then(() => {
        renderGarage();
      });

      return;
    }

    void updateCar(editingCarId, car).then(() => {
      editingCarId = null;
      renderGarage();
    });
  });

  return form;
}

function getCarFormData(formData: FormData): CreateCar | null {
  const name = formData.get('name');
  const color = formData.get('color');

  if (typeof name !== 'string' || typeof color !== 'string') {
    return null;
  }

  return {
    name,
    color,
  };
}

async function changePage(page: number): Promise<void> {
  garageState.page = page;
  await loadCars();
  renderGarage();
}

function createPagination(): HTMLDivElement {
  const pagination = document.createElement('div');

  pagination.className = 'pagination';

  const prevButton = document.createElement('button');
  prevButton.textContent = 'Prev';
  prevButton.disabled = garageState.page === 1;

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';

  const totalPages = Math.ceil(
    garageState.totalCount / garageState.limit,
  );

  nextButton.disabled = garageState.page >= totalPages;

  prevButton.addEventListener('click', () => {
    void changePage(garageState.page - 1);
  });

  nextButton.addEventListener('click', () => {
    void changePage(garageState.page + 1);
  });

  pagination.append(prevButton, nextButton);

  return pagination;
}

export function renderGarage(): void {
  const garage = document.createElement('section');

  garage.className = 'garage';

  garage.append(createCarForm());
  garage.append(createGarageHeader());

  garageState.cars.forEach((car) => {
    garage.append(
      createCarElement(car, {
        onUpdate: () => {
          editingCarId = car.id;
          renderGarage();
        },
        onDelete: () => {
          void deleteCar(car.id).then(() => {
            renderGarage();
          });
        },
      }),
    );
  });

  garage.append(createPagination());

  const page = document.querySelector<HTMLElement>('#page');

  if (page === null) {
    throw new Error('Page container was not found');
  }

  page.replaceChildren(garage);
}