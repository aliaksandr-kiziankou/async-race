import type { Car, WinnerSortField } from '../state/types.ts';

import { getCars } from '../api/garage-api.ts';
import { winnersState, loadWinners } from '../state/winners-state.ts';

function createWinnerRow(winner: typeof winnersState.winners[number], index: number, cars: Car[]): HTMLTableRowElement {
  const car = cars.find((item) => item.id === winner.id);

  const row = document.createElement('tr');

  if (car === undefined) {
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>Car #${winner.id}</td>
      <td>Unknown</td>
      <td>${winner.wins}</td>
      <td>${winner.time.toFixed(2)}</td>
    `;

    return row;
  }

  row.innerHTML = `
    <td>${index + 1}</td>
    <td>
      <svg
        class="winner-car-image"
        viewBox="0 0 100 40"
        aria-label="${car.name}"
      >
        <path
          fill="${car.color}"
          d="M10 25h80l-5-12H65L55 5H35L25 13H15z"
        />
        <circle cx="25" cy="28" r="6" />
        <circle cx="75" cy="28" r="6" />
      </svg>
    </td>
    <td>${car.name}</td>
    <td>${winner.wins}</td>
    <td>${winner.time.toFixed(2)}</td>
  `;

  return row;
}

export async function renderWinners(): Promise<void> {
  await loadWinners();

  const { cars } = await getCars(1, 100);

  const winners = createWinnersElement();

  renderWinnersTable(winners, cars);
  winners.append(createPagination());

  renderSortButtons(winners);

  const page = document.querySelector<HTMLElement>('#page');

  if (page === null) {
    throw new Error('Page container was not found');
  }

  page.replaceChildren(winners);
}

function createWinnersElement(): HTMLElement {
  const winners = document.createElement('section');

  winners.className = 'winners';

  winners.innerHTML = `
    <h1>Winners</h1>
    <p>Page #${winnersState.page}</p>
    <p>Winners: ${winnersState.totalCount}</p>
  `;

  return winners;
}

function renderWinnersTable(winners: HTMLElement, cars: Car[]): void {
  winners.insertAdjacentHTML(
    'beforeend',
    `
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Car image</th>
            <th>Name</th>
            <th>
              <button class="sort-button" data-sort="wins">
                Wins
                ${getSortIndicator('wins')}
              </button>
            </th>
            <th>
              <button class="sort-button" data-sort="time">
                Best time (seconds)
                ${getSortIndicator('time')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `,
  );

  const tbody =
    winners.querySelector<HTMLTableSectionElement>('tbody');

  if (tbody === null) {
    throw new Error('Winners table body was not found');
  }

  winnersState.winners.forEach((winner, index) => {
    tbody.append(createWinnerRow(winner, index, cars));
  });
}

function getSortIndicator(field: WinnerSortField): string {
  if (winnersState.sort !== field) {
    return '';
  }

  return winnersState.order === 'ASC' ? '↑' : '↓';
}

function renderSortButtons(winners: HTMLElement): void {
  const buttons =
    winners.querySelectorAll<HTMLButtonElement>(
      '.sort-button',
    );

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const sort = button.dataset.sort;

      if (sort !== 'wins' && sort !== 'time') {
        return;
      }

      if (winnersState.sort === sort) {
        winnersState.order =
          winnersState.order === 'DESC'
            ? 'ASC'
            : 'DESC';
      } else {
        winnersState.sort = sort;
        winnersState.order = 'DESC';
      }

      winnersState.page = 1;

      void renderWinners();
    });
  });
}

function createPagination(): HTMLDivElement {
  const pagination = document.createElement('div');

  pagination.className = 'pagination';

  const prevButton = document.createElement('button');
  prevButton.textContent = 'Prev';
  prevButton.disabled = winnersState.page === 1;

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';

  const totalPages = Math.ceil(
    winnersState.totalCount / winnersState.limit,
  );

  nextButton.disabled = winnersState.page >= totalPages;

  prevButton.addEventListener('click', () => {
    winnersState.page -= 1;
    void renderWinners();
  });

  nextButton.addEventListener('click', () => {
    winnersState.page += 1;
    void renderWinners();
  });

  pagination.append(prevButton, nextButton);

  return pagination;
}