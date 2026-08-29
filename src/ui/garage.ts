import type { Car, CreateCar } from '../state/types.ts';
import { garageState } from '../state/store.ts';
import { createCar, deleteCar, loadCars, updateCar } from '../state/garage-state.ts';
import { createCarElement } from './car.ts';
import { raceState } from '../state/race-state.ts';
import { startRace } from '../animation/race.ts';

let editingCarId: number | null = null;

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

  const startRaceButton = header.querySelector<HTMLButtonElement>('.start-race');

  if (startRaceButton === null) {
    throw new Error('Start Race button was not found');
  }

  startRaceButton.addEventListener('click', () => {
    void startRace(
      garageState.cars,
      (id) => {
        const car = document.querySelector<HTMLDivElement>(
          `.car[data-id="${id}"]`,
        );

        if (car === null) {
        return null;
        }

        const image = car.querySelector<SVGElement>('.car-image');
        const track = car.querySelector<HTMLDivElement>('.car-track');

        if (image === null || track === null) {
          return null;
        }

        return {
          image,
          track,
        };
      },
    );
  });

  return header;
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

  const app = document.querySelector<HTMLDivElement>('#app');

  if (app === null) {
    throw new Error('App root element was not found');
  }

  app.replaceChildren(garage);
}