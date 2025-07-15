// modules/render.js
import { pokedexContainer, modal, modalBody } from './domElements.js';
import { getPokemonDetails, fetchData } from './api.js'; // fetchData needed for species details in modal

export const renderPokemon = (pokemonList) => {
    pokedexContainer.innerHTML = '';
    if (pokemonList.length === 0) {
        pokedexContainer.innerHTML = '<p class="no-results">Geen Pokémon gevonden die aan de criteria voldoen.</p>';
        return;
    }

    pokemonList.forEach(pokemon => {
        if (!pokemon || !pokemon.sprites || !pokemon.types) {
            console.warn("Skipping rendering for incomplete Pokemon data:", pokemon);
            return;
        }

        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <img src="${pokemon.sprites.front_default || 'placeholder.png'}" alt="${pokemon.name}">
            <p class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</p>
            <h2>${pokemon.name}</h2>
            <div class="pokemon-types">
                ${pokemon.types.map(typeInfo => `
                    <span class="type-badge" style="background-color: var(--type-${typeInfo.type.name})">
                        ${typeInfo.type.name}
                    </span>
                `).join('')}
            </div>
        `;
        card.addEventListener('click', () => showPokemonDetails(pokemon));
        pokedexContainer.appendChild(card);
    });
};

export const showPokemonDetails = async (pokemon) => {
    const details = pokemon;

    if (!details || !details.species) {
        console.error("Cannot show details: Incomplete Pokemon object or missing species data", details);
        return;
    }

    let speciesData;
    try {
        speciesData = await fetchData(details.species.url);
    } catch (error) {
        console.error("Failed to fetch species data for:", details.name, error);
        modalBody.innerHTML = `<p class="error">Kon beschrijving niet laden.</p>`;
        modal.style.display = 'flex';
        return;
    }
    
    const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
    const flavorText = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/[\n\f\r]/g, ' ') : 'Geen beschrijving beschikbaar.';

    modalBody.innerHTML = `
        <img src="${details.sprites.other['official-artwork'].front_default}" alt="${details.name}" style="width: 200px; display: block; margin: 0 auto;">
        <h2>${details.name} (#${details.id})</h2>
        <p><b>Hoogte:</b> ${details.height / 10} m</p>
        <p><b>Gewicht:</b> ${details.weight / 10} kg</p>
        <p><b>Beschrijving:</b> ${flavorText}</p>
        <div class="pokemon-types">
            <b>Types:</b> ${details.types.map(typeInfo => `
                <span class="type-badge" style="background-color: var(--type-${typeInfo.type.name})">
                    ${typeInfo.type.name}
                </span>
            `).join(' ')}
        </div>
    `;
    modal.style.display = 'flex';
};

export const populateGenerationDropdown = async (generationSelectElement) => {
    const { API_URL } = await import('./state.js'); 
    const { fetchData } = await import('./api.js'); 

    const data = await fetchData(`${API_URL}generation`);
    if (!data || !data.results) return;

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Alle Pokémon';
    generationSelectElement.appendChild(allOption);
    
    data.results.forEach((gen, index) => {
        const option = document.createElement('option');
        option.value = gen.url;
        option.textContent = `Generatie ${index + 1}`;
        generationSelectElement.appendChild(option);
    });
};

export const populateTypeFilters = async (typeFilterContainerElement) => {
    const { API_URL } = await import('./state.js'); 
    const { fetchData } = await import('./api.js');
    const { filterAndSortPokemon } = await import('../script.js');

    const data = await fetchData(`${API_URL}type`);
    if (!data || !data.results) return;

    data.results.filter(type => type.name !== 'unknown' && type.name !== 'shadow').forEach(type => {
        const button = document.createElement('button');
        button.textContent = type.name;
        button.dataset.type = type.name;
        
        button.addEventListener('click', (e) => {
            const clickedButton = e.target;
            
            if (clickedButton.classList.contains('active')) {
                clickedButton.classList.remove('active');
            } else {
                document.querySelectorAll('#type-filter-buttons button').forEach(btn => btn.classList.remove('active'));
                clickedButton.classList.add('active');
            }
            
            filterAndSortPokemon();
        });
        typeFilterContainerElement.appendChild(button);
    });
};