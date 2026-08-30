import type { CreateCar } from '../state/types.ts';

const BRANDS = [
  'Tesla',
  'BMW',
  'Ford',
  'Audi',
  'Toyota',
  'Honda',
  'Nissan',
  'Porsche',
  'Mazda',
  'Subaru',
  'Opel',
  'Reno',
];

const MODELS = [
  'Model S',
  'Mustang',
  'Civic',
  'Corolla',
  'Supra',
  '911',
  'Impreza',
  'A4',
  'MX-5',
  'Skyline',
  'Astra',
  'Logan',
];

const COLORS = [
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#008000',
  '#000000',
  '#0073ba',
  '#ff3787',
];

function getRandomItem<T>(items: T[]): T {
  const index = Math.floor(Math.random() * items.length);
  const item = items.at(index);

  if (item === undefined) {
    throw new Error('Cannot get random item');
  }

  return item;
}

export function generateRandomCar(): CreateCar {
  return {
    name: `${getRandomItem(BRANDS)} ${getRandomItem(MODELS)}`,
    color: getRandomItem(COLORS),
  };
}