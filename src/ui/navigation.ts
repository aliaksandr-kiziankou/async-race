import { renderGarage } from './garage.ts';
import { renderWinners } from './winners.ts';

export function createNavigation(): HTMLElement {
  const navigation = document.createElement('nav');

  navigation.className = 'navigation';

  navigation.innerHTML = `
    <button type="button" class="garage-link">
      Garage
    </button>

    <button type="button" class="winners-link">
      Winners
    </button>
  `;

  const garageButton =
    navigation.querySelector<HTMLButtonElement>('.garage-link');

  const winnersButton =
    navigation.querySelector<HTMLButtonElement>('.winners-link');

  if (garageButton === null || winnersButton === null) {
    throw new Error('Navigation buttons were not found');
  }

  garageButton.addEventListener('click', () => {
    renderGarage();
  });

  winnersButton.addEventListener('click', () => {
    void renderWinners();
  });

  return navigation;
}