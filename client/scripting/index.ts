import { renderApplicationCards } from './applications';
import { toggleSidebar, renderSidebar } from './sidebar';


window.addEventListener('load', async (e) => {
    renderSidebar();

    // initially render application cards
    const request = await fetch('/api/applications');
    const response = await request.json();
    const applications = response.table;

    renderApplicationCards(applications);

    // add event listeners to various buttons
    document.getElementById('menuButton').addEventListener('click', toggleSidebar);
});