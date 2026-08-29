import './style.css';
import { loadCars } from './state/garage-state.ts';
import { renderGarage } from './ui/garage.ts';

async function init(): Promise<void> {
  await loadCars();
  renderGarage();
}

init();