import './style.css';

import { createNavigation } from './ui/navigation.ts';
import { renderGarage } from './ui/garage.ts';
import { loadCars } from './state/garage-state.ts';

const app = document.querySelector<HTMLDivElement>('#app');

if (app === null) {
  throw new Error('App root element was not found');
}

app.append(createNavigation());

const page = document.createElement('main');

page.id = 'page';

app.append(page);

void loadCars().then(() => {
  renderGarage();
});