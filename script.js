import * as DOMElements from './modules/domElements.js';
import { API_URL, allPokemonData, setAllPokemonData } from './modules/state.js';
import { getPokemonDetails, fetchData } from './modules/api.js';
import { 
    renderPokemon, 
    populateGenerationDropdown, 
    populateTypeFilters,
    showPokemonDetails
} from './modules/render.js';
import { showCookieBanner } from './modules/utils.js';
import { setupEventListeners } from './modules/eventListeners.js';

// --- LOGICA ---
export const loadPokemonByGeneration = async (url) => {
    let pokemonURLsToFetch = []; 

    if (url === 'all') {
        const data = await fetchData(`${API_URL}pokemon?limit=1025`); 
        if (!data || !data.results) {
            setAllPokemonData([]); 
            filterAndSortPokemon(); 
            return;
        }
        pokemonURLsToFetch = data.results.map(p => p.url); 
    } else {
        const data = await fetchData(url); 
        if (!data || !data.pokemon_species) {
            setAllPokemonData([]); 
            filterAndSortPokemon(); 
            return;
        }
        pokemonURLsToFetch = data.pokemon_species.map(species => {
            const id = species.url.split('/').filter(Boolean).pop();
            return `${API_URL}pokemon/${id}/`; 
        });
    }
    
    const results = await Promise.allSettled(pokemonURLsToFetch.map(url => getPokemonDetails({ url })));
    
    const fetchedPokemon = results
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);
        
    fetchedPokemon.sort((a, b) => a.id - b.id);
    setAllPokemonData(fetchedPokemon);
    
    filterAndSortPokemon();
};

export const filterAndSortPokemon = () => {
    let filteredPokemon = [...allPokemonData];

    const searchTerm = DOMElements.searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredPokemon = filteredPokemon.filter(p => p.name.includes(searchTerm));
    }
    
    const activeTypeButton = document.querySelector('#type-filter-buttons button.active');
    if (activeTypeButton) {
        const type = activeTypeButton.dataset.type;
        filteredPokemon = filteredPokemon.filter(p => p.types.some(t => t.type.name === type));
    }

    const activeSortButton = document.querySelector('#sort-buttons button.active') || document.querySelector('[data-sort="id-asc"]');
    const sortOrder = activeSortButton.dataset.sort;

    switch (sortOrder) {
        case 'id-desc':
            filteredPokemon.sort((a, b) => b.id - a.id);
            break;
        case 'name-asc':
            filteredPokemon.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredPokemon.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'id-asc':
        default: 
            filteredPokemon.sort((a, b) => a.id - b.id); 
            break;
    }
    
    renderPokemon(filteredPokemon);
};

const init = async () => {
    showCookieBanner();

    await populateGenerationDropdown(DOMElements.generationSelect);
    await populateTypeFilters(DOMElements.typeFilterContainer);
    
    if (DOMElements.generationSelect.options.length > 1) {
        DOMElements.generationSelect.value = 'all'; 
        await loadPokemonByGeneration('all'); 
    }

    setupEventListeners(); 
};

document.addEventListener('DOMContentLoaded', init);