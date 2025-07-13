import { API_URL, pokemonDetailsCache } from './state.js';
import { showLoader, hideLoader } from './utils.js';
import { pokedexContainer } from './domElements.js';

export const fetchData = async (url) => {
    showLoader();
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Fout bij ophalen data:", error);
        pokedexContainer.innerHTML = `<p class="error">Kon data niet laden. Probeer het later opnieuw.</p>`;
        throw error; 
    } finally {
        hideLoader(); 
    }
};

export const getPokemonDetails = async (pokemonRef) => {
    const url = pokemonRef.url || `${API_URL}pokemon/${pokemonRef.name}`;
    if (pokemonDetailsCache.has(url)) {
        return pokemonDetailsCache.get(url);
    }
    const details = await fetchData(url);
    pokemonDetailsCache.set(url, details);
    return details;
};