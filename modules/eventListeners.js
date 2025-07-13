// modules/eventListeners.js
import { 
    generationSelect, 
    searchInput, 
    sortButtons, 
    closeModalButton, 
    modal, 
    acceptCookiesButton,
    cookieBanner 
} from './domElements.js';
import { loadPokemonByGeneration, filterAndSortPokemon } from '../script.js'; // Main logic functions
import { setCookie } from './utils.js';

export const setupEventListeners = () => {
    generationSelect.addEventListener('change', (e) => {
        loadPokemonByGeneration(e.target.value);
    });

    searchInput.addEventListener('input', () => filterAndSortPokemon());

    sortButtons.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelectorAll('#sort-buttons button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            filterAndSortPokemon();
        }
    });

    closeModalButton.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    acceptCookiesButton.addEventListener('click', () => {
        setCookie('cookies_accepted', 'true', 365);
        cookieBanner.style.display = 'none';
    });
};